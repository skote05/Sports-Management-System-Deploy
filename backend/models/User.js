import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create(userData) {
    try {
      const { 
        username, 
        email, 
        password, 
        role, 
        firstName, 
        lastName, 
        phoneNumber, 
        dateOfBirth 
      } = userData;
      
      // Validate required fields
      if (!username || !email || !password || !firstName || !lastName) {
        throw new Error('Required fields are missing');
      }

      // Validate phone number if provided
      if (phoneNumber && !/^\d{10,15}$/.test(phoneNumber)) {
        throw new Error('Phone number must be between 10 and 15 digits');
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const [result] = await pool.execute(
        `INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone_number, date_of_birth, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
          username,
          email,
          hashedPassword,
          role || 'player',
          firstName,
          lastName,
          phoneNumber || null,
          dateOfBirth || null
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('[User.create] Error:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('[User.findByEmail] Error:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      console.error('[User.findByUsername] Error:', error);
      throw error;
    }
  }

  static async findById(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT user_id, username, email, role, first_name, last_name, phone_number, date_of_birth, profile_picture, status, created_at, updated_at FROM users WHERE user_id = ?',
        [userId]
      );
      return rows[0];
    } catch (error) {
      console.error('[User.findById] Error:', error);
      throw error;
    }
  }

  static async getAllPlayers() {
    try {
      const [rows] = await pool.execute(
        `SELECT user_id, username, email, first_name, last_name, phone_number, status, created_at, updated_at
         FROM users WHERE role = 'player' ORDER BY created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error('[User.getAllPlayers] Error:', error);
      throw error;
    }
  }

  static async update(userId, updateData) {
    try {
      const allowedFields = ['first_name', 'last_name', 'phone_number', 'date_of_birth', 'status'];
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(userId);

      const [result] = await pool.execute(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('[User.update] Error:', error);
      throw error;
    }
  }

  static async updatePassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const [result] = await pool.execute(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
        [hashedPassword, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('[User.updatePassword] Error:', error);
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('[User.validatePassword] Error:', error);
      throw error;
    }
  }

  static async delete(userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[User.delete] Error:', error);
      throw error;
    }
  }
}

export default User;
