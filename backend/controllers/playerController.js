import Match from '../models/Match.js';
import Team from '../models/Team.js';
import pool from '../config/database.js';

export const getPlayerMatches = async (req, res) => {
  try {
    const playerId = req.user.user_id;

    // Get upcoming matches
    const [upcomingMatches] = await pool.execute(`
      SELECT m.match_id, m.match_date, m.status, m.home_score, m.away_score,
             ht.team_name as home_team_name, at.team_name as away_team_name,
             v.venue_name, t.tournament_name, ht.sport,
             CASE 
               WHEN ht_tp.player_id = ? THEN 'home'
               WHEN at_tp.player_id = ? THEN 'away'
               ELSE NULL
             END as player_team_side
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      JOIN venues v ON m.venue_id = v.venue_id
      LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
      LEFT JOIN team_players ht_tp ON ht.team_id = ht_tp.team_id AND ht_tp.player_id = ?
      LEFT JOIN team_players at_tp ON at.team_id = at_tp.team_id AND at_tp.player_id = ?
      WHERE (ht_tp.player_id = ? OR at_tp.player_id = ?)
        AND m.match_date > NOW()
        AND m.status = 'scheduled'
      ORDER BY m.match_date ASC
    `, [playerId, playerId, playerId, playerId, playerId, playerId]);

    // Get match history
    const [matchHistory] = await pool.execute(`
      SELECT m.match_id, m.match_date, m.status, m.home_score, m.away_score,
             ht.team_name as home_team_name, at.team_name as away_team_name,
             v.venue_name, t.tournament_name, ht.sport,
             CASE 
               WHEN ht_tp.player_id = ? THEN 'home'
               WHEN at_tp.player_id = ? THEN 'away'
               ELSE NULL
             END as player_team_side
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      JOIN venues v ON m.venue_id = v.venue_id
      LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
      LEFT JOIN team_players ht_tp ON ht.team_id = ht_tp.team_id AND ht_tp.player_id = ?
      LEFT JOIN team_players at_tp ON at.team_id = at_tp.team_id AND at_tp.player_id = ?
      WHERE (ht_tp.player_id = ? OR at_tp.player_id = ?)
        AND m.status = 'completed'
      ORDER BY m.match_date DESC
    `, [playerId, playerId, playerId, playerId, playerId, playerId]);

    res.json({
      success: true,
      upcomingMatches: upcomingMatches,
      matchHistory: matchHistory
    });
  } catch (error) {
    console.error('Get player matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches',
      error: error.message
    });
  }
};

export const registerForTournament = async (req, res) => {
  try {
    const { tournamentId, teamId } = req.body;
    const playerId = req.user.user_id;

    // Check if already registered
    const [existing] = await pool.execute(
      'SELECT * FROM registrations WHERE player_id = ? AND tournament_id = ?',
      [playerId, tournamentId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this tournament'
      });
    }

    // Insert registration
    const [result] = await pool.execute(
      'INSERT INTO registrations (player_id, tournament_id, team_id, registration_fee) VALUES (?, ?, ?, ?)',
      [playerId, tournamentId, teamId, 100.00] // Default fee
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registrationId: result.insertId
    });
  } catch (error) {
    console.error('Tournament registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

export const getPlayerTeams = async (req, res) => {
  try {
    // FIXED: Removed is_active check since we use hard deletes
    const [rows] = await pool.execute(`
      SELECT t.team_id, t.team_name, t.sport, t.max_players,
             tp.position, tp.jersey_number, tp.joined_date,
             CONCAT(c.first_name, ' ', c.last_name) as coach_name
      FROM teams t
      JOIN team_players tp ON t.team_id = tp.team_id
      LEFT JOIN users c ON t.coach_id = c.user_id AND c.role = 'coach'
      WHERE tp.player_id = ?
      ORDER BY tp.joined_date DESC
    `, [req.user.user_id]);

    res.json({
      success: true,
      teams: rows
    });
  } catch (error) {
    console.error('Get player teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
};

export const getPlayerProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT user_id, username, email, first_name, last_name, phone_number, date_of_birth, status, profile_picture, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      profile: rows[0]
    });
  } catch (error) {
    console.error('Get player profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

export const updatePlayerProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, date_of_birth, email } = req.body;
    const playerId = req.user.user_id;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if email is already taken by another user
    const [existingEmail] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
      [email, playerId]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }

    // Update profile
    await pool.execute(
      `UPDATE users 
       SET first_name = ?, last_name = ?, phone_number = ?, date_of_birth = ?, email = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [first_name, last_name, phone_number || null, date_of_birth || null, email, playerId]
    );

    // Get updated profile
    const [updatedProfile] = await pool.execute(
      'SELECT user_id, username, email, first_name, last_name, phone_number, date_of_birth, status, profile_picture, created_at FROM users WHERE user_id = ?',
      [playerId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile[0]
    });
  } catch (error) {
    console.error('Update player profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

export const getPlayerSports = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, sport, skill_level, is_primary, created_at FROM player_sports WHERE player_id = ? ORDER BY is_primary DESC, created_at ASC',
      [req.user.user_id]
    );

    res.json({
      success: true,
      sports: rows
    });
  } catch (error) {
    console.error('Get player sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sports',
      error: error.message
    });
  }
};

export const addPlayerSport = async (req, res) => {
  try {
    const { sport, skill_level, is_primary } = req.body;
    const playerId = req.user.user_id;

    // Validate required fields
    if (!sport || !skill_level) {
      return res.status(400).json({
        success: false,
        message: 'Sport and skill level are required'
      });
    }

    // Check if sport already exists for this player
    const [existing] = await pool.execute(
      'SELECT id FROM player_sports WHERE player_id = ? AND sport = ?',
      [playerId, sport]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Sport already exists for this player'
      });
    }

    // If this is primary sport, unset other primary sports
    if (is_primary) {
      await pool.execute(
        'UPDATE player_sports SET is_primary = FALSE WHERE player_id = ?',
        [playerId]
      );
    }

    // Add new sport
    const [result] = await pool.execute(
      'INSERT INTO player_sports (player_id, sport, skill_level, is_primary) VALUES (?, ?, ?, ?)',
      [playerId, sport, skill_level, is_primary || false]
    );

    // Get the added sport
    const [newSport] = await pool.execute(
      'SELECT id, sport, skill_level, is_primary, created_at FROM player_sports WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Sport added successfully',
      sport: newSport[0]
    });
  } catch (error) {
    console.error('Add player sport error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sport',
      error: error.message
    });
  }
};

export const updatePlayerSport = async (req, res) => {
  try {
    const { sportId } = req.params;
    const { sport, skill_level, is_primary } = req.body;
    const playerId = req.user.user_id;

    // Check if sport belongs to player
    const [existing] = await pool.execute(
      'SELECT id FROM player_sports WHERE id = ? AND player_id = ?',
      [sportId, playerId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sport not found'
      });
    }

    // If this is primary sport, unset other primary sports
    if (is_primary) {
      await pool.execute(
        'UPDATE player_sports SET is_primary = FALSE WHERE player_id = ? AND id != ?',
        [playerId, sportId]
      );
    }

    // Update sport
    await pool.execute(
      'UPDATE player_sports SET sport = ?, skill_level = ?, is_primary = ? WHERE id = ? AND player_id = ?',
      [sport, skill_level, is_primary || false, sportId, playerId]
    );

    // Get updated sport
    const [updatedSport] = await pool.execute(
      'SELECT id, sport, skill_level, is_primary, created_at FROM player_sports WHERE id = ?',
      [sportId]
    );

    res.json({
      success: true,
      message: 'Sport updated successfully',
      sport: updatedSport[0]
    });
  } catch (error) {
    console.error('Update player sport error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sport',
      error: error.message
    });
  }
};

export const deletePlayerSport = async (req, res) => {
  try {
    const { sportId } = req.params;
    const playerId = req.user.user_id;

    // Check if sport belongs to player
    const [existing] = await pool.execute(
      'SELECT id FROM player_sports WHERE id = ? AND player_id = ?',
      [sportId, playerId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sport not found'
      });
    }

    // Delete sport
    await pool.execute(
      'DELETE FROM player_sports WHERE id = ? AND player_id = ?',
      [sportId, playerId]
    );

    res.json({
      success: true,
      message: 'Sport deleted successfully'
    });
  } catch (error) {
    console.error('Delete player sport error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sport',
      error: error.message
    });
  }
};

export const getPlayerTournaments = async (req, res) => {
  try {
    const playerId = req.user.user_id;

    // Get ALL tournaments with player participation status
    const [tournaments] = await pool.execute(`
      SELECT t.tournament_id, t.tournament_name, t.sport, 
             t.start_date, t.end_date, t.entry_fee, t.status, t.description,
             t.max_teams,
             player_participation.team_name,
             CASE 
               WHEN player_participation.team_name IS NOT NULL THEN 'participating'
               WHEN t.status = 'completed' THEN 'completed'
               WHEN t.status = 'cancelled' THEN 'cancelled'
               WHEN t.start_date > CURDATE() THEN 'available'
               ELSE 'ongoing'
             END as participation_status,
             (SELECT COUNT(DISTINCT CASE WHEN m.home_team_id THEN m.home_team_id ELSE m.away_team_id END) 
              FROM matches m WHERE m.tournament_id = t.tournament_id) as registered_teams
      FROM tournaments t
      LEFT JOIN (
        SELECT DISTINCT t.tournament_id, tm.team_name
        FROM tournaments t
        JOIN matches m ON t.tournament_id = m.tournament_id
        JOIN teams tm ON (m.home_team_id = tm.team_id OR m.away_team_id = tm.team_id)
        JOIN team_players tp ON tm.team_id = tp.team_id
        WHERE tp.player_id = ?
      ) player_participation ON t.tournament_id = player_participation.tournament_id
      ORDER BY 
        CASE 
          WHEN t.status = 'ongoing' THEN 1
          WHEN t.status = 'upcoming' THEN 2
          WHEN t.status = 'completed' THEN 3
          ELSE 4
        END,
        t.start_date DESC
    `, [playerId]);

    res.json({
      success: true,
      tournaments: tournaments
    });
  } catch (error) {
    console.error('Get player tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player tournaments',
      error: error.message
    });
  }
};

export const getPlayerNotifications = async (req, res) => {
  try {
    // For now, return mock notifications. In a real app, you'd have a notifications table
    const mockNotifications = [
      {
        id: 1,
        title: 'Match Reminder',
        message: 'Your match against Rangers FC is scheduled for tomorrow at 3:00 PM',
        type: 'match',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: 2,
        title: 'Team Update',
        message: 'New player John Doe has joined your team',
        type: 'team',
        is_read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: 3,
        title: 'Tournament Registration',
        message: 'Registration for Spring Tournament 2024 is now open',
        type: 'tournament',
        is_read: false,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      }
    ];

    res.json({
      success: true,
      notifications: mockNotifications
    });
  } catch (error) {
    console.error('Get player notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // In a real app, you'd update the notification in the database
    // For now, just return success
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    // In a real app, you'd update all notifications for the player
    // For now, just return success
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

export const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    const playerId = req.user.user_id;

    // FIXED: Removed is_active check since we use hard deletes
    const [teamMembership] = await pool.execute(
      'SELECT * FROM team_players WHERE team_id = ? AND player_id = ?',
      [teamId, playerId]
    );

    if (teamMembership.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Get team information with coach details
    const [teamInfo] = await pool.execute(`
      SELECT t.team_id, t.team_name, t.sport, t.max_players, t.status,
             CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, '')) as coach_name,
             c.email as coach_email, 
             c.phone_number as coach_phone,
             c.user_id as coach_id
      FROM teams t
      LEFT JOIN users c ON t.coach_id = c.user_id AND c.role = 'coach'
      WHERE t.team_id = ?
    `, [teamId]);

    if (teamInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // FIXED: Removed is_active check since we use hard deletes
    const [teammates] = await pool.execute(`
      SELECT u.user_id as player_id, u.first_name, u.last_name, u.email, u.status,
             tp.position, tp.jersey_number, tp.joined_date,
             ps.skill_level
      FROM team_players tp
      JOIN users u ON tp.player_id = u.user_id
      LEFT JOIN player_sports ps ON u.user_id = ps.player_id 
        AND ps.sport = (SELECT sport FROM teams WHERE team_id = ?) 
        AND ps.is_primary = TRUE
      WHERE tp.team_id = ?
      ORDER BY tp.joined_date ASC
    `, [teamId, teamId]);

    // Get team match statistics
    const [matchStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN 
          (m.home_team_id = ? AND m.home_score > m.away_score) OR 
          (m.away_team_id = ? AND m.away_score > m.home_score) 
        THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN 
          (m.home_team_id = ? AND m.home_score < m.away_score) OR 
          (m.away_team_id = ? AND m.away_score < m.home_score) 
        THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) as draws
      FROM matches m
      WHERE (m.home_team_id = ? OR m.away_team_id = ?) 
        AND m.status = 'completed'
    `, [teamId, teamId, teamId, teamId, teamId, teamId]);

    const statistics = {
      total_players: teammates.length,
      total_matches: matchStats[0]?.total_matches || 0,
      wins: matchStats[0]?.wins || 0,
      losses: matchStats[0]?.losses || 0,
      draws: matchStats[0]?.draws || 0
    };

    res.json({
      success: true,
      team: teamInfo[0],
      teammates,
      statistics
    });
  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team details',
      error: error.message
    });
  }
};

export const getCoachInfo = async (req, res) => {
  try {
    const { coachId } = req.params;

    const [coach] = await pool.execute(
      'SELECT user_id, first_name, last_name, email, phone_number, status FROM users WHERE user_id = ? AND role = "coach"',
      [coachId]
    );

    if (coach.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    res.json({
      success: true,
      coach: coach[0]
    });
  } catch (error) {
    console.error('Get coach info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coach information',
      error: error.message
    });
  }
};
