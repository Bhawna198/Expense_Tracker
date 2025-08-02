const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./config/initDb');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

// Default route
app.get('/', (req, res) => {
  res.send('Expense Tracker API is running');
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

initializeDatabase().then(success => {
  if (success) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    console.error('Server not started due to database initialization failure');
    process.exit(1);
  }
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});