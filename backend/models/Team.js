import pool from '../config/database.js';

class Team {
  static async create(teamData) {
    const { teamName, sport, maxPlayers, coachId } = teamData;
    
    const [result] = await pool.execute(
      'INSERT INTO teams (team_name, sport, max_players, coach_id) VALUES (?, ?, ?, ?)',
      [teamName, sport, maxPlayers, coachId]
    );
    
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT t.*, 
             CONCAT(u.first_name, ' ', u.last_name) as coach_name,
             (SELECT COUNT(*) FROM team_players tp WHERE tp.team_id = t.team_id AND tp.is_active = TRUE) as current_players
      FROM teams t 
      LEFT JOIN users u ON t.coach_id = u.user_id 
      WHERE t.status = 'active'
      ORDER BY t.created_date DESC
    `);
    return rows;
  }

  static async getById(teamId) {
    const [rows] = await pool.execute(`
      SELECT t.*, 
             CONCAT(u.first_name, ' ', u.last_name) as coach_name
      FROM teams t 
      LEFT JOIN users u ON t.coach_id = u.user_id 
      WHERE t.team_id = ?
    `, [teamId]);
    return rows[0];
  }

  static async addPlayer(teamId, playerId, position, jerseyNumber) {
    const [result] = await pool.execute(
      'INSERT INTO team_players (team_id, player_id, position, jersey_number) VALUES (?, ?, ?, ?)',
      [teamId, playerId, position, jerseyNumber]
    );
    return result.insertId;
  }

  static async getTeamPlayers(teamId) {
    const [rows] = await pool.execute(`
      SELECT tp.*, 
             CONCAT(u.first_name, ' ', u.last_name) as player_name,
             u.email
      FROM team_players tp
      JOIN users u ON tp.player_id = u.user_id
      WHERE tp.team_id = ? AND tp.is_active = TRUE
    `, [teamId]);
    return rows;
  }

  static async removePlayer(teamId, playerId) {
    const [result] = await pool.execute(
      'UPDATE team_players SET is_active = FALSE WHERE team_id = ? AND player_id = ?',
      [teamId, playerId]
    );
    return result.affectedRows > 0;
  }
}

export default Team;
