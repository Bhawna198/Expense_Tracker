const User = require('../models/User');
const Expense = require('../models/Expense');
const { testConnection } = require('./db');

async function initializeDatabase() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to the database. Please check your configuration.');
      return false;
    }

    // Create tables
    await User.createTable();
    await Expense.createTable();

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    return false;
  }
}

module.exports = { initializeDatabase };