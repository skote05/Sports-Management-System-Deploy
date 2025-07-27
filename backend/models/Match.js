import pool from '../config/database.js';

class Match {
  static async create(matchData) {
    const { tournamentId, homeTeamId, awayTeamId, venueId, matchDate, durationMinutes } = matchData;
    
    const [result] = await pool.execute(
      'INSERT INTO matches (tournament_id, home_team_id, away_team_id, venue_id, match_date, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)',
      [tournamentId, homeTeamId, awayTeamId, venueId, matchDate, durationMinutes || 90]
    );
    
    return result.insertId;
  }

  static async getUpcoming() {
    const [rows] = await pool.execute(`
      SELECT m.*, 
             ht.team_name as home_team_name,
             at.team_name as away_team_name,
             v.venue_name,
             v.location,
             t.tournament_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      JOIN venues v ON m.venue_id = v.venue_id
      LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
      WHERE m.match_date > NOW() AND m.status = 'scheduled'
      ORDER BY m.match_date ASC
    `);
    return rows;
  }

  static async getByPlayerId(playerId) {
    const [rows] = await pool.execute(`
      SELECT DISTINCT m.*, 
             ht.team_name as home_team_name,
             at.team_name as away_team_name,
             ht.sport,
             v.venue_name,
             v.location,
             t.tournament_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      JOIN venues v ON m.venue_id = v.venue_id
      LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
      WHERE (m.home_team_id IN (SELECT team_id FROM team_players WHERE player_id = ? AND is_active = TRUE)
             OR m.away_team_id IN (SELECT team_id FROM team_players WHERE player_id = ? AND is_active = TRUE))
      ORDER BY m.match_date DESC
    `, [playerId, playerId]);
    return rows;
  }

  static async updateScore(matchId, homeScore, awayScore) {
    const [result] = await pool.execute(
      'UPDATE matches SET home_score = ?, away_score = ?, status = "completed" WHERE match_id = ?',
      [homeScore, awayScore, matchId]
    );
    return result.affectedRows > 0;
  }

  static async getById(matchId) {
    const [rows] = await pool.execute(`
      SELECT m.*, 
             ht.team_name as home_team_name,
             at.team_name as away_team_name,
             ht.sport,
             v.venue_name,
             v.location,
             t.tournament_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      JOIN venues v ON m.venue_id = v.venue_id
      LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
      WHERE m.match_id = ?
    `, [matchId]);
    return rows[0];
  }
}

export default Match;
