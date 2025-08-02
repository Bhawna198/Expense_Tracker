# Expense Tracker Application

A full-stack expense tracking application built with React, Node.js, Express, and MySQL.

## Features

- User authentication (register, login, logout)
- Add, edit, and delete expenses
- Categorize expenses
- Visualize expenses by category (pie chart)
- Track monthly spending (bar chart)
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React
- React Router for navigation
- Chart.js for data visualization
- Axios for API requests

### Backend
- Node.js
- Express.js
- MySQL for database
- JSON Web Tokens (JWT) for authentication

## Project Structure

```
├── backend/             # Backend Node.js/Express application
│   ├── config/          # Database and configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── server.js        # Entry point for the backend
│
└── frontend/            # Frontend React application
    ├── public/          # Static files
    └── src/             # React source files
        ├── components/  # Reusable components
        ├── context/     # React context for state management
        ├── pages/       # Page components
        ├── styles/      # CSS styles
        └── utils/       # Utility functions
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL server

### Database Setup

1. Create a MySQL database named `expense_tracker`
2. The application will automatically create the necessary tables on startup

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables in `.env` file:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=expense_tracker
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/user` - Get authenticated user data

### Expenses

- `GET /api/expenses` - Get all expenses for authenticated user
- `GET /api/expenses/:id` - Get a specific expense
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/expenses/summary/monthly` - Get monthly expense summary
- `GET /api/expenses/summary/category` - Get expense summary by category