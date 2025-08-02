const User = require('../models/User');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { testConnection } = require('./db');

async function initializeDatabase() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to the database. Please check your configuration.');
      return false;
    }

    // Create tables in correct order (users first, then budgets, then expenses)
    console.log('Creating users table...');
    await User.createTable();
    
    console.log('Creating budgets table...');
    await Budget.createTable();
    
    console.log('Creating expenses table...');
    await Expense.createTable();

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    return false;
  }
}

module.exports = { initializeDatabase };