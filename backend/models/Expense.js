const { pool } = require('../config/db');

class Expense {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        budget_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    try {
      await pool.query(createTableQuery);
      console.log('Expenses table created or already exists');
      
      // Add budget_id foreign key constraint separately to handle existing tables
      try {
        await pool.query(`
          ALTER TABLE expenses
          ADD CONSTRAINT fk_expense_budget
          FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL
        `);
        console.log('Budget foreign key constraint added to expenses table');
      } catch (constraintError) {
        // Constraint might already exist, which is fine
        if (!constraintError.message.includes('Duplicate key name')) {
          console.log('Budget foreign key constraint already exists or budgets table not ready yet');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error creating expenses table:', error.message);
      return false;
    }
    
    try {
      await pool.query(createTableQuery);
      console.log('Expenses table created or already exists');
      return true;
    } catch (error) {
      console.error('Error creating expenses table:', error.message);
      return false;
    }
  }

  static async create(expenseData) {
    const { user_id, amount, description, category, date, budget_id } = expenseData;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO expenses (user_id, amount, description, category, date, budget_id) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, amount, description, category, date, budget_id || null]
      );
      
      const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
      return rows[0];
    } catch (error) {
      console.error('Error creating expense:', error.message);
      throw error;
    }
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      return rows;
    } catch (error) {
      console.error('Error finding expenses by user ID:', error.message);
      throw error;
    }
  }

  static async findById(id, userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding expense by ID:', error.message);
      throw error;
    }
  }

  static async update(id, userId, expenseData) {
    const { amount, description, category, date, budget_id } = expenseData;
    
    try {
      const [result] = await pool.query(
        'UPDATE expenses SET amount = ?, description = ?, category = ?, date = ?, budget_id = ? WHERE id = ? AND user_id = ?',
        [amount, description, category, date, budget_id || null, id, userId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error updating expense:', error.message);
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM expenses WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting expense:', error.message);
      throw error;
    }
  }

  static async getMonthlyTotal(userId, year, month) {
    try {
      const [rows] = await pool.query(
        'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ?',
        [userId, year, month]
      );
      return rows[0].total || 0;
    } catch (error) {
      console.error('Error getting monthly total:', error.message);
      throw error;
    }
  }

  static async getCategorySummary(userId, startDate, endDate) {
    try {
      const [rows] = await pool.query(
        'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ? GROUP BY category ORDER BY total DESC',
        [userId, startDate, endDate]
      );
      return rows;
    } catch (error) {
      console.error('Error getting category summary:', error.message);
      throw error;
    }
  }
  static async findByBudgetId(budgetId, userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM expenses WHERE budget_id = ? AND user_id = ? ORDER BY date DESC',
        [budgetId, userId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding expenses by budget ID:', error.message);
      throw error;
    }
  }

  static async getExpensesWithBudgets(userId, limit = 50, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT
          e.*,
          b.name as budget_name,
          b.category as budget_category
        FROM expenses e
        LEFT JOIN budgets b ON e.budget_id = b.id
        WHERE e.user_id = ?
        ORDER BY e.date DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);
      return rows;
    } catch (error) {
      console.error('Error finding expenses with budgets:', error.message);
      throw error;
    }
  }
}

module.exports = Expense;