// Database migration script - Run this to add budget_id column to existing expenses table
const { pool } = require('./backend/config/db');

async function migrateDatabase() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Check if budget_id column exists
    console.log('📋 Checking if budget_id column exists in expenses table...');
    
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'expenses' 
      AND COLUMN_NAME = 'budget_id'
    `);
    
    if (columns.length === 0) {
      console.log('➕ Adding budget_id column to expenses table...');
      
      // Add budget_id column
      await pool.query(`
        ALTER TABLE expenses 
        ADD COLUMN budget_id INT NULL 
        AFTER date
      `);
      
      console.log('✅ budget_id column added successfully!');
    } else {
      console.log('✅ budget_id column already exists!');
    }
    
    // Check if budgets table exists
    console.log('📋 Checking if budgets table exists...');
    
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'budgets'
    `);
    
    if (tables.length === 0) {
      console.log('➕ Creating budgets table...');
      
      // Create budgets table
      await pool.query(`
        CREATE TABLE budgets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          period ENUM('weekly', 'monthly', 'yearly') DEFAULT 'monthly',
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          is_recurring BOOLEAN DEFAULT FALSE,
          status ENUM('active', 'completed', 'paused') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ budgets table created successfully!');
    } else {
      console.log('✅ budgets table already exists!');
    }
    
    // Add foreign key constraint if it doesn't exist
    console.log('🔗 Adding foreign key constraint...');
    
    try {
      await pool.query(`
        ALTER TABLE expenses 
        ADD CONSTRAINT fk_expense_budget 
        FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL
      `);
      console.log('✅ Foreign key constraint added successfully!');
    } catch (constraintError) {
      if (constraintError.message.includes('Duplicate key name')) {
        console.log('✅ Foreign key constraint already exists!');
      } else {
        console.log('⚠️  Foreign key constraint warning:', constraintError.message);
      }
    }
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    
    const [expenseColumns] = await pool.query(`
      DESCRIBE expenses
    `);
    
    const hasBudgetId = expenseColumns.some(col => col.Field === 'budget_id');
    
    if (hasBudgetId) {
      console.log('✅ Migration completed successfully!');
      console.log('📊 Database structure updated:');
      console.log('   - expenses table now has budget_id column');
      console.log('   - budgets table exists');
      console.log('   - Foreign key relationship established');
      console.log('');
      console.log('🎉 You can now restart your server and create budgets!');
    } else {
      console.log('❌ Migration verification failed');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log('');
    console.log('💡 Manual fix: Run these SQL commands in your database:');
    console.log('');
    console.log('ALTER TABLE expenses ADD COLUMN budget_id INT NULL AFTER date;');
    console.log('');
    console.log('CREATE TABLE IF NOT EXISTS budgets (');
    console.log('  id INT AUTO_INCREMENT PRIMARY KEY,');
    console.log('  user_id INT NOT NULL,');
    console.log('  name VARCHAR(255) NOT NULL,');
    console.log('  category VARCHAR(100) NOT NULL,');
    console.log('  amount DECIMAL(10,2) NOT NULL,');
    console.log('  period ENUM("weekly", "monthly", "yearly") DEFAULT "monthly",');
    console.log('  start_date DATE NOT NULL,');
    console.log('  end_date DATE NOT NULL,');
    console.log('  is_recurring BOOLEAN DEFAULT FALSE,');
    console.log('  status ENUM("active", "completed", "paused") DEFAULT "active",');
    console.log('  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
    console.log('  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    console.log(');');
  }
  
  process.exit(0);
}

migrateDatabase();