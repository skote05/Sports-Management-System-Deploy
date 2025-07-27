import User from '../models/User.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';
import pool from '../config/database.js';

const getAdminCount = async () => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as admin_count FROM users WHERE role = "admin" AND status = "active"'
  );
  return rows[0].admin_count;
};

export const getAllPlayers = async (req, res) => {
  try {
    const players = await User.getAllPlayers();
    res.json({ success: true, players });
  } catch (error) {
    console.error('Get all players error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch players',
      error: error.message
    });
  }
};

export const getAllPlayersWithStatus = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        u.user_id, u.username, u.email, u.first_name, u.last_name, 
        u.phone_number, u.status, u.created_at, u.updated_at,
        GROUP_CONCAT(DISTINCT t.team_name) as teams,
        GROUP_CONCAT(DISTINCT ps.sport ORDER BY ps.is_primary DESC, ps.sport) as sports,
        GROUP_CONCAT(DISTINCT CONCAT(ps.sport, '(', ps.skill_level, ')') ORDER BY ps.is_primary DESC, ps.sport) as sports_with_level
      FROM users u
      LEFT JOIN team_players tp ON u.user_id = tp.player_id
      LEFT JOIN teams t ON tp.team_id = t.team_id
      LEFT JOIN player_sports ps ON u.user_id = ps.player_id
      WHERE u.role = 'player'
    `;
    
    const params = [];
    
    if (status && ['active', 'inactive', 'deleted'].includes(status)) {
      query += ' AND u.status = ?';
      params.push(status);
    }
    
    query += ' GROUP BY u.user_id ORDER BY u.status, u.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      players: rows
    });
  } catch (error) {
    console.error('Get all players with status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch players',
      error: error.message
    });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { deleteType } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete players'
      });
    }

    const [playerCheck] = await pool.execute(
      'SELECT user_id, role, first_name, last_name, status FROM users WHERE user_id = ? AND role = "player"',
      [playerId]
    );

    if (playerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    const player = playerCheck[0];
    let message = '';

    if (deleteType === 'permanent') {
      // Permanent delete - hard delete everything
      await pool.execute('DELETE FROM player_sports WHERE player_id = ?', [playerId]);
      await pool.execute('DELETE FROM team_players WHERE player_id = ?', [playerId]);
      await pool.execute('DELETE FROM registrations WHERE player_id = ?', [playerId]);
      await pool.execute('DELETE FROM users WHERE user_id = ? AND role = "player"', [playerId]);
      message = `Player ${player.first_name} ${player.last_name} permanently deleted`;
    } else {
      // Soft delete user but hard delete team associations
      await pool.execute(
        'UPDATE users SET status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND role = "player"',
        [playerId]
      );
      await pool.execute('DELETE FROM team_players WHERE player_id = ?', [playerId]);
      message = `Player ${player.first_name} ${player.last_name} moved to deleted status and removed from all teams`;
    }

    res.json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete player',
      error: error.message
    });
  }
};

export const updatePlayerStatus = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'deleted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or deleted'
      });
    }

    const [result] = await pool.execute(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND role = "player"',
      [status, playerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Hard delete approach - remove from teams when status is not active
    if (status === 'deleted' || status === 'inactive') {
      await pool.execute(
        'DELETE FROM team_players WHERE player_id = ?',
        [playerId]
      );
    }

    res.json({
      success: true,
      message: `Player status updated to ${status}${status !== 'active' ? ' and removed from all teams' : ''}`
    });

  } catch (error) {
    console.error('Update player status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update player status',
      error: error.message
    });
  }
};

export const getPlayerStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM users 
      WHERE role = 'player' 
      GROUP BY status
    `);
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player statistics',
      error: error.message
    });
  }
};

export const getPlayerSports = async (req, res) => {
  try {
    const { playerId } = req.params;

    const [sports] = await pool.execute(`
      SELECT sport, skill_level, is_primary 
      FROM player_sports 
      WHERE player_id = ?
      ORDER BY is_primary DESC, sport
    `, [playerId]);

    res.json({
      success: true,
      sports: sports
    });

  } catch (error) {
    console.error('Get player sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player sports',
      error: error.message
    });
  }
};

export const updatePlayerSports = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { sports } = req.body;

    // Validate input
    if (!sports || !Array.isArray(sports)) {
      return res.status(400).json({
        success: false,
        message: 'Sports array is required'
      });
    }

    // Start transaction for atomic operation
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove existing sports for the player
      await connection.execute(
        'DELETE FROM player_sports WHERE player_id = ?',
        [playerId]
      );

      // Add new sports
      for (const sport of sports) {
        await connection.execute(
          'INSERT INTO player_sports (player_id, sport, skill_level, is_primary) VALUES (?, ?, ?, ?)',
          [playerId, sport.sport, sport.skill_level, sport.is_primary || false]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Player sports updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Update player sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update player sports',
      error: error.message
    });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT user_id, username, email, first_name, last_name, status, created_at 
       FROM users WHERE role = 'admin' ORDER BY created_at DESC`
    );
    
    res.json({
      success: true,
      admins: rows
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phoneNumber, dateOfBirth } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create new admin accounts'
      });
    }

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: username, email, password, firstName, lastName are mandatory'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must contain at least 10 digits'
        });
      }
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const userId = await User.create({
      username,
      email,
      password,
      role: 'admin',
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      dateOfBirth: dateOfBirth || null
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      adminId: userId
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create admin',
      error: error.message
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const currentAdminId = req.user.user_id;

    if (parseInt(adminId) === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    const adminCount = await getAdminCount();
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last admin account. At least one admin must remain.'
      });
    }

    const [result] = await pool.execute(
      'UPDATE users SET status = "inactive" WHERE user_id = ? AND role = "admin"',
      [adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message
    });
  }
};

export const reactivateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const [result] = await pool.execute(
      'UPDATE users SET status = "active" WHERE user_id = ? AND role = "admin"',
      [adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin account reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate admin',
      error: error.message
    });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { teamName, sport, maxPlayers, coachId } = req.body;

    if (!teamName || !sport) {
      return res.status(400).json({
        success: false,
        message: 'Team name and sport are required'
      });
    }

    // If coachId is provided, verify the coach exists and is active
    if (coachId) {
      const [coachCheck] = await pool.execute(
        'SELECT user_id FROM users WHERE user_id = ? AND role = "coach" AND status = "active"',
        [coachId]
      );

      if (coachCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected coach not found or not active'
        });
      }
    }

    const teamId = await Team.create({
      teamName,
      sport,
      maxPlayers: maxPlayers || 15,
      coachId: coachId || null
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      teamId
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const [teamCheck] = await pool.execute(
      'SELECT team_id, team_name FROM teams WHERE team_id = ?',
      [teamId]
    );

    if (teamCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await pool.execute('DELETE FROM team_players WHERE team_id = ?', [teamId]);
    await pool.execute('DELETE FROM teams WHERE team_id = ?', [teamId]);

    res.json({
      success: true,
      message: `Team ${teamCheck[0].team_name} deleted successfully`
    });

  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team',
      error: error.message
    });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT t.team_id, t.team_name, t.sport, t.max_players, t.coach_id, t.created_date, t.status,
             CONCAT(u.first_name, ' ', u.last_name) as coach_name,
             COUNT(DISTINCT tp.player_id) as current_players
      FROM teams t
      LEFT JOIN users u ON t.coach_id = u.user_id AND u.role = 'coach' AND u.status = 'active'
      LEFT JOIN team_players tp ON t.team_id = tp.team_id
      GROUP BY t.team_id, t.team_name, t.sport, t.max_players, t.coach_id, t.created_date, t.status, u.first_name, u.last_name
      ORDER BY t.created_date DESC
    `);
    
    res.json({
      success: true,
      teams: rows
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.getById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const players = await Team.getTeamPlayers(teamId);

    res.json({
      success: true,
      team: { ...team, players }
    });
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team details',
      error: error.message
    });
  }
};

export const removePlayerFromTeam = async (req, res) => {
  try {
    const { teamId, playerId } = req.params;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required'
      });
    }

    // Check if player exists in team (no is_active check needed)
    const [playerCheck] = await pool.execute(
      `SELECT tp.*, u.first_name, u.last_name, t.team_name 
       FROM team_players tp
       JOIN users u ON tp.player_id = u.user_id
       JOIN teams t ON tp.team_id = t.team_id
       WHERE tp.team_id = ? AND tp.player_id = ?`,
      [teamId, playerId]
    );

    if (playerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in team'
      });
    }

    const player = playerCheck[0];

    // HARD DELETE - Remove the record from database
    await pool.execute(
      'DELETE FROM team_players WHERE team_id = ? AND player_id = ?',
      [teamId, playerId]
    );

    res.json({
      success: true,
      message: `${player.first_name} ${player.last_name} removed from ${player.team_name} successfully`
    });

  } catch (error) {
    console.error('Remove player from team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove player from team',
      error: error.message
    });
  }
};

export const getAvailablePlayersForTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const [teamInfo] = await pool.execute(
      'SELECT sport FROM teams WHERE team_id = ?',
      [teamId]
    );

    if (teamInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const teamSport = teamInfo[0].sport;

    // Since we're using hard deletes, just check if player is NOT in team_players table at all
    const [availablePlayers] = await pool.execute(`
      SELECT DISTINCT 
        u.user_id, u.first_name, u.last_name, u.email,
        ps.skill_level, ps.is_primary
      FROM users u
      JOIN player_sports ps ON u.user_id = ps.player_id
      LEFT JOIN team_players tp ON u.user_id = tp.player_id
      WHERE u.role = 'player' 
        AND u.status = 'active'
        AND ps.sport = ?
        AND tp.player_id IS NULL
      ORDER BY ps.is_primary DESC, ps.skill_level DESC, u.first_name
    `, [teamSport]);

    res.json({
      success: true,
      players: availablePlayers,
      teamSport: teamSport
    });

  } catch (error) {
    console.error('Get available players error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available players',
      error: error.message
    });
  }
};

export const addPlayersToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { players } = req.body;

    if (!Array.isArray(players) || players.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Players array is required and cannot be empty'
      });
    }

    const playerIds = players.map(p => p.playerId);

    // Check if team exists
    const [teamCheck] = await pool.execute(
      'SELECT team_id, team_name, max_players FROM teams WHERE team_id = ?',
      [teamId]
    );

    if (teamCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const team = teamCheck[0];

    // Check current team size (removed is_active check)
    const [currentPlayers] = await pool.execute(
      'SELECT COUNT(*) as count FROM team_players WHERE team_id = ?',
      [teamId]
    );

    const currentCount = currentPlayers[0].count;
    const newPlayerCount = playerIds.length;

    if (currentCount + newPlayerCount > team.max_players) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${newPlayerCount} players. Team capacity: ${team.max_players}, Current: ${currentCount}`
      });
    }

    // Check if any players are already in ANY team (since we use hard deletes)
    const [existingPlayers] = await pool.execute(
      `SELECT player_id FROM team_players 
       WHERE player_id IN (${playerIds.map(() => '?').join(',')})`,
      [...playerIds]
    );

    if (existingPlayers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some players are already assigned to teams'
      });
    }

    // Check for duplicate jersey numbers within the team (removed is_active check)
    const jerseyNumbers = players
      .map(p => p.jerseyNumber)
      .filter(num => num && !isNaN(num));
    
    if (jerseyNumbers.length > 0) {
      const [existingJerseys] = await pool.execute(
        `SELECT jersey_number FROM team_players 
         WHERE team_id = ? AND jersey_number IN (${jerseyNumbers.map(() => '?').join(',')})`,
        [teamId, ...jerseyNumbers]
      );

      if (existingJerseys.length > 0) {
        const conflictNumbers = existingJerseys.map(row => row.jersey_number);
        return res.status(400).json({
          success: false,
          message: `Jersey numbers already in use: ${conflictNumbers.join(', ')}`
        });
      }

      // Check for duplicate jersey numbers in the current batch
      const duplicates = jerseyNumbers.filter((num, index) => jerseyNumbers.indexOf(num) !== index);
      if (duplicates.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Duplicate jersey numbers in selection: ${[...new Set(duplicates)].join(', ')}`
        });
      }
    }

    // Add all players to the team (removed is_active column)
    const addPromises = players.map(playerData => {
      const { playerId, position, jerseyNumber } = playerData;
      return pool.execute(
        'INSERT INTO team_players (team_id, player_id, position, jersey_number, joined_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [teamId, playerId, position || null, jerseyNumber || null]
      );
    });

    await Promise.all(addPromises);

    res.json({
      success: true,
      message: `Successfully added ${newPlayerCount} players to ${team.team_name}`
    });

  } catch (error) {
    console.error('Add players to team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add players to team',
      error: error.message
    });
  }
};

export const getTeamPlayers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const [players] = await pool.execute(`
      SELECT 
        u.user_id, u.first_name, u.last_name, u.email,
        tp.position, tp.jersey_number, tp.joined_date
      FROM users u
      JOIN team_players tp ON u.user_id = tp.player_id
      WHERE tp.team_id = ?
      ORDER BY u.first_name, u.last_name
    `, [teamId]);

    res.json({
      success: true,
      players: players
    });

  } catch (error) {
    console.error('Get team players error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team players',
      error: error.message
    });
  }
};

export const scheduleMatch = async (req, res) => {
  try {
    const { 
      tournamentId, 
      homeTeamId, 
      awayTeamId, 
      venueId, 
      matchDate, 
      durationMinutes = 90 
    } = req.body;

    // Validate required fields
    if (!homeTeamId || !awayTeamId || !venueId || !matchDate) {
      return res.status(400).json({
        success: false,
        message: 'Home team, away team, venue, and match date are required'
      });
    }

    // Convert date string to MySQL datetime format
    const mysqlDateTime = new Date(matchDate).toISOString().slice(0, 19).replace('T', ' ');

    // Validate teams are different
    if (homeTeamId === awayTeamId) {
      return res.status(400).json({
        success: false,
        message: 'Home team and away team must be different'
      });
    }

    // Check if tournament exists if provided and validate sport compatibility
    let finalTournamentId = null;
    let tournamentSport = null;
    if (tournamentId) {
      const [tournamentCheck] = await pool.execute(
        'SELECT tournament_id, sport, start_date, end_date FROM tournaments WHERE tournament_id = ?',
        [tournamentId]
      );
      
      if (tournamentCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        });
      }
      
      const tournament = tournamentCheck[0];
      finalTournamentId = tournamentId;
      tournamentSport = tournament.sport;
      
      // Validate match date is within tournament window
      const matchDateObj = new Date(matchDate);
      const tournamentStartDate = new Date(tournament.start_date);
      const tournamentEndDate = new Date(tournament.end_date);
      
      if (matchDateObj < tournamentStartDate || matchDateObj > tournamentEndDate) {
        return res.status(400).json({
          success: false,
          message: `Match date must be within tournament window (${tournamentStartDate.toLocaleDateString()} to ${tournamentEndDate.toLocaleDateString()})`
        });
      }
    }

    // Get team sports for validation
    const [homeTeam] = await pool.execute(
      'SELECT team_id, team_name, sport FROM teams WHERE team_id = ?',
      [homeTeamId]
    );

    const [awayTeam] = await pool.execute(
      'SELECT team_id, team_name, sport FROM teams WHERE team_id = ?',
      [awayTeamId]
    );

    if (homeTeam.length === 0 || awayTeam.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'One or both teams not found'
      });
    }

    // Validate that both teams play the same sport
    if (homeTeam[0].sport !== awayTeam[0].sport) {
      return res.status(400).json({
        success: false,
        message: `Teams must play the same sport. ${homeTeam[0].team_name} plays ${homeTeam[0].sport} and ${awayTeam[0].team_name} plays ${awayTeam[0].sport}`
      });
    }

    // If tournament is specified, validate that teams' sport matches tournament sport
    if (tournamentSport && homeTeam[0].sport !== tournamentSport) {
      return res.status(400).json({
        success: false,
        message: `Teams play ${homeTeam[0].sport} but tournament is for ${tournamentSport}. Cannot schedule ${homeTeam[0].sport} match in ${tournamentSport} tournament.`
      });
    }

    // Insert match into database
    const [result] = await pool.execute(
      'INSERT INTO matches (tournament_id, home_team_id, away_team_id, venue_id, match_date, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)',
      [finalTournamentId, homeTeamId, awayTeamId, venueId, mysqlDateTime, durationMinutes]
    );

    res.status(201).json({
      success: true,
      message: 'Match scheduled successfully',
      match_id: result.insertId
    });
  } catch (error) {
    console.error('Schedule match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule match',
      error: error.message
    });
  }
};

export const updateMatchScore = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { homeScore, awayScore } = req.body;

    if (homeScore < 0 || awayScore < 0) {
      return res.status(400).json({
        success: false,
        message: 'Scores cannot be negative'
      });
    }

    const updated = await Match.updateScore(matchId, homeScore, awayScore);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      message: 'Match score updated successfully'
    });
  } catch (error) {
    console.error('Update match score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update match score',
      error: error.message
    });
  }
};

export const getAllMatches = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT m.*, 
             ht.team_name as home_team_name,
             at.team_name as away_team_name,
             v.venue_name, v.location,
             t.tournament_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      JOIN venues v ON m.venue_id = v.venue_id
      LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE m.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY m.match_date DESC';
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      matches: rows
    });
  } catch (error) {
    console.error('Get all matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches',
      error: error.message
    });
  }
};

export const createTournament = async (req, res) => {
  try {
    const { 
      tournamentName, 
      sport, 
      startDate, 
      endDate, 
      entryFee = 0, 
      maxTeams, 
      description 
    } = req.body;

    // Validate required fields
    if (!tournamentName || !sport || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Tournament name, sport, start date, and end date are required'
      });
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj >= endDateObj) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Insert tournament into database
    const [result] = await pool.execute(
      'INSERT INTO tournaments (tournament_name, sport, start_date, end_date, entry_fee, max_teams, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tournamentName, sport, startDate, endDate, entryFee, maxTeams, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      tournament_id: result.insertId
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tournament',
      error: error.message
    });
  }
};

export const getAllTournaments = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT t.tournament_id, t.tournament_name, t.sport, t.start_date, t.end_date, 
             t.entry_fee, t.max_teams, t.status, t.description,
             (SELECT COUNT(DISTINCT team_id) FROM (
               SELECT home_team_id as team_id FROM matches WHERE tournament_id = t.tournament_id
               UNION
               SELECT away_team_id as team_id FROM matches WHERE tournament_id = t.tournament_id
             ) as tournament_teams) as registered_teams
      FROM tournaments t
      ORDER BY t.start_date DESC, t.tournament_id DESC
    `);
    
    res.json({
      success: true,
      tournaments: rows
    });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournaments',
      error: error.message
    });
  }
};

export const getAllVenues = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM venues ORDER BY venue_name');
    res.json({ success: true, venues: rows });
  } catch (error) {
    console.error('Get all venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues',
      error: error.message
    });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Check if tournament exists
    const [tournamentCheck] = await pool.execute(
      'SELECT tournament_id, tournament_name FROM tournaments WHERE tournament_id = ?',
      [tournamentId]
    );

    if (tournamentCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if tournament has matches
    const [matchesCheck] = await pool.execute(
      'SELECT COUNT(*) as match_count FROM matches WHERE tournament_id = ?',
      [tournamentId]
    );

    if (matchesCheck[0].match_count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete tournament with scheduled matches. Please delete matches first.'
      });
    }

    // Delete tournament
    await pool.execute('DELETE FROM tournaments WHERE tournament_id = ?', [tournamentId]);

    res.json({
      success: true,
      message: `Tournament ${tournamentCheck[0].tournament_name} deleted successfully`
    });

  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tournament',
      error: error.message
    });
  }
};

export const createVenue = async (req, res) => {
  try {
    const { venueName, location, capacity, facilityType } = req.body;

    if (!venueName || !location) {
      return res.status(400).json({
        success: false,
        message: 'Venue name and location are required'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO venues (venue_name, location, capacity, facility_type) VALUES (?, ?, ?, ?)',
      [venueName, location, capacity || null, facilityType || null]
    );

    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      venueId: result.insertId
    });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create venue',
      error: error.message
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [playerStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_players,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_players,
        COUNT(CASE WHEN status = 'deleted' THEN 1 END) as deleted_players,
        COUNT(*) as total_players
      FROM users WHERE role = 'player'
    `);

    const [teamStats] = await pool.execute(`
      SELECT COUNT(*) as total_teams FROM teams WHERE status = 'active'
    `);

    const [matchStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_matches,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_matches,
        COUNT(*) as total_matches
      FROM matches
    `);

    const [tournamentStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_tournaments,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing_tournaments,
        COUNT(*) as total_tournaments
      FROM tournaments
    `);

    res.json({
      success: true,
      stats: {
        players: playerStats[0],
        teams: teamStats[0],
        matches: matchStats[0],
        tournaments: tournamentStats[0]
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

export const promotePlayerToCoach = async (req, res) => {
  try {
    const { playerId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can promote players to coaches'
      });
    }

    const [result] = await pool.execute(
      'UPDATE users SET role = "coach" WHERE user_id = ? AND role = "player"',
      [playerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      message: 'Player promoted to coach successfully'
    });
  } catch (error) {
    console.error('Promote player to coach error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to promote player to coach',
      error: error.message
    });
  }
};

export const getAllCoaches = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, 
             u.phone_number, u.status, u.created_at, u.updated_at,
             GROUP_CONCAT(DISTINCT CONCAT(ps.sport, ' (', ps.skill_level, ')') SEPARATOR ', ') as sports_with_level
      FROM users u
      LEFT JOIN player_sports ps ON u.user_id = ps.player_id
      WHERE u.role = 'coach'
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
    `);
    
    res.json({
      success: true,
      coaches: rows
    });
  } catch (error) {
    console.error('Get coaches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coaches',
      error: error.message
    });
  }
};

export const createCoach = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phoneNumber, dateOfBirth, sports } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check username uniqueness
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Create coach user
      const userId = await User.create({
        username,
        email,
        password,
        role: 'coach',
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth
      });

      // Add coach sports
      for (const sport of sports) {
        await pool.execute(
          'INSERT INTO player_sports (player_id, sport, skill_level, is_primary) VALUES (?, ?, ?, ?)',
          [userId, sport.sport, sport.skill_level, sport.is_primary || false]
        );
      }

      await pool.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Coach created successfully',
        coachId: userId
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create coach error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coach',
      error: error.message
    });
  }
};

export const updateCoachStatus = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { status } = req.body;

    const [result] = await pool.execute(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE user_id = ? AND role = "coach"',
      [status, coachId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    res.json({
      success: true,
      message: 'Coach status updated successfully'
    });
  } catch (error) {
    console.error('Update coach status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coach status',
      error: error.message
    });
  }
};

export const updateCoachSports = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { sports } = req.body;

    // Validate input
    if (!sports || !Array.isArray(sports)) {
      return res.status(400).json({
        success: false,
        message: 'Sports array is required'
      });
    }

    // Check if coach exists
    const [coachCheck] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ? AND role = "coach"',
      [coachId]
    );

    if (coachCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    // Start transaction for atomic operation
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove existing sports for the coach (coaches use player_sports table)
      await connection.execute(
        'DELETE FROM player_sports WHERE player_id = ?',
        [coachId]
      );

      // Add new sports
      for (const sport of sports) {
        await connection.execute(
          'INSERT INTO player_sports (player_id, sport, skill_level, is_primary) VALUES (?, ?, ?, ?)',
          [coachId, sport.sport, sport.skill_level, sport.is_primary || false]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Coach sports updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Update coach sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coach sports',
      error: error.message
    });
  }
};

export const deleteCoach = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { deleteType = 'soft' } = req.body;

    if (deleteType === 'permanent') {
      // Start transaction for permanent delete
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Delete coach's sports first (coaches use player_sports table)
        await connection.execute('DELETE FROM player_sports WHERE player_id = ?', [coachId]);
        
        // Delete the coach user
        await connection.execute('DELETE FROM users WHERE user_id = ? AND role = "coach"', [coachId]);
        
        await connection.commit();
        connection.release();
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } else {
      // Soft delete
      await pool.execute(
        'UPDATE users SET status = "deleted", updated_at = NOW() WHERE user_id = ? AND role = "coach"',
        [coachId]
      );
    }

    res.json({
      success: true,
      message: `Coach ${deleteType === 'permanent' ? 'permanently deleted' : 'deleted'} successfully`
    });
  } catch (error) {
    console.error('Delete coach error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coach',
      error: error.message
    });
  }
};

export const getCoachSports = async (req, res) => {
  try {
    const { coachId } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM player_sports WHERE player_id = ?',
      [coachId]
    );
    
    res.json({
      success: true,
      sports: rows
    });
  } catch (error) {
    console.error('Get coach sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coach sports',
      error: error.message
    });
  }
};

export const updateTeamCoach = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { coach_id } = req.body;

    // Validate input
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required'
      });
    }

    // Check if team exists
    const [teamCheck] = await pool.execute(
      'SELECT team_id, team_name, sport FROM teams WHERE team_id = ?',
      [teamId]
    );

    if (teamCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const team = teamCheck[0];
    let finalCoachId = null;

    // If coach_id is provided, validate it
    if (coach_id) {
      const [coachCheck] = await pool.execute(
        'SELECT user_id, first_name, last_name FROM users WHERE user_id = ? AND role = "coach"',
        [coach_id]
      );

      if (coachCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Coach not found'
        });
      }

      // Check if coach has the required sport (coaches use player_sports table)
      const [coachSports] = await pool.execute(
        'SELECT sport FROM player_sports WHERE player_id = ?',
        [coach_id]
      );

      const coachSportNames = coachSports.map(cs => cs.sport);
      if (!coachSportNames.includes(team.sport)) {
        return res.status(400).json({
          success: false,
          message: `Coach must have ${team.sport} in their sports list`
        });
      }

      finalCoachId = coach_id;
    }

    // Update team coach in database
    const [result] = await pool.execute(
      'UPDATE teams SET coach_id = ? WHERE team_id = ?',
      [finalCoachId, teamId]
    );

    res.json({
      success: true,
      message: 'Team coach updated successfully'
    });
  } catch (error) {
    console.error('Update team coach error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team coach',
      error: error.message
    });
  }
};

export const getTournamentMatches = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const [matches] = await pool.execute(`
      SELECT m.match_id, m.match_date, m.status, m.home_score, m.away_score, m.duration_minutes,
             ht.team_name as home_team_name,
             at.team_name as away_team_name,
             v.venue_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      JOIN venues v ON m.venue_id = v.venue_id
      WHERE m.tournament_id = ?
      ORDER BY m.match_date ASC
    `, [tournamentId]);

    res.json({
      success: true,
      matches: matches
    });
  } catch (error) {
    console.error('Get tournament matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament matches',
      error: error.message
    });
  }
};

export const getFriendlyMatches = async (req, res) => {
  try {
    const [matches] = await pool.execute(`
      SELECT m.match_id, m.match_date, m.status, m.home_score, m.away_score, m.duration_minutes,
             ht.team_name as home_team_name, ht.sport,
             at.team_name as away_team_name,
             v.venue_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      JOIN venues v ON m.venue_id = v.venue_id
      WHERE m.tournament_id IS NULL
      ORDER BY m.match_date DESC
    `);

    res.json({
      success: true,
      matches: matches
    });
  } catch (error) {
    console.error('Get friendly matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friendly matches',
      error: error.message
    });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM matches WHERE match_id = ?',
      [matchId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete match',
      error: error.message
    });
  }
};
