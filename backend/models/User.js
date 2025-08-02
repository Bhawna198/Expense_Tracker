const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.query(createTableQuery);
      console.log('Users table created or already exists');
      return true;
    } catch (error) {
      console.error('Error creating users table:', error.message);
      return false;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error.message);
      return null;
    }
  }

  static async create(userData) {
    const { name, email, password } = userData;
    
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert user
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      
      // Get the created user
      const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [result.insertId]);
      return rows[0];
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;