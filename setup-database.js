// Database setup script - Run this to create all required tables
const { initializeDatabase } = require('./backend/config/initDb');

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    const success = await initializeDatabase();
    
    if (success) {
      console.log('✅ Database setup completed successfully!');
      console.log('📊 All tables have been created:');
      console.log('   - users');
      console.log('   - budgets');
      console.log('   - expenses (with budget_id column)');
      console.log('');
      console.log('🎉 You can now start the application with: npm run dev');
    } else {
      console.log('❌ Database setup failed. Please check your database configuration.');
    }
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  }
  
  process.exit(0);
}

setupDatabase();