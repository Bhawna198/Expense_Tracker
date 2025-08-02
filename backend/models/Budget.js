const { pool } = require('../config/db');

class Budget {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS budgets (
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
    `;
    
    try {
      await pool.query(createTableQuery);
      console.log('Budgets table created or already exists');
      return true;
    } catch (error) {
      console.error('Error creating budgets table:', error.message);
      return false;
    }
  }

  static async create(budgetData) {
    const { user_id, name, category, amount, period, start_date, end_date, is_recurring } = budgetData;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO budgets (user_id, name, category, amount, period, start_date, end_date, is_recurring) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, name, category, amount, period, start_date, end_date, is_recurring || false]
      );
      
      const [rows] = await pool.query('SELECT * FROM budgets WHERE id = ?', [result.insertId]);
      return rows[0];
    } catch (error) {
      console.error('Error creating budget:', error.message);
      throw error;
    }
  }

  static async findByUserId(userId, status = 'active') {
    try {
      let query = 'SELECT * FROM budgets WHERE user_id = ?';
      let params = [userId];
      
      if (status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding budgets by user ID:', error.message);
      throw error;
    }
  }

  static async findById(id, userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM budgets WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding budget by ID:', error.message);
      throw error;
    }
  }

  static async update(id, userId, budgetData) {
    const { name, category, amount, period, start_date, end_date, is_recurring, status } = budgetData;
    
    try {
      const [result] = await pool.query(
        'UPDATE budgets SET name = ?, category = ?, amount = ?, period = ?, start_date = ?, end_date = ?, is_recurring = ?, status = ? WHERE id = ? AND user_id = ?',
        [name, category, amount, period, start_date, end_date, is_recurring, status, id, userId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      const [rows] = await pool.query('SELECT * FROM budgets WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error updating budget:', error.message);
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM budgets WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting budget:', error.message);
      throw error;
    }
  }

  static async getBudgetWithExpenses(budgetId, userId) {
    try {
      // Get budget details
      const [budgetRows] = await pool.query(
        'SELECT * FROM budgets WHERE id = ? AND user_id = ?',
        [budgetId, userId]
      );
      
      if (budgetRows.length === 0) {
        return null;
      }
      
      const budget = budgetRows[0];
      
      // Get expenses for this budget
      const [expenseRows] = await pool.query(
        'SELECT * FROM expenses WHERE budget_id = ? AND user_id = ? ORDER BY date DESC',
        [budgetId, userId]
      );
      
      // Calculate spent amount
      const totalSpent = expenseRows.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      
      return {
        ...budget,
        expenses: expenseRows,
        total_spent: totalSpent,
        remaining: parseFloat(budget.amount) - totalSpent,
        progress_percentage: (totalSpent / parseFloat(budget.amount)) * 100
      };
    } catch (error) {
      console.error('Error getting budget with expenses:', error.message);
      throw error;
    }
  }

  static async getBudgetSummary(userId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          b.*,
          COALESCE(SUM(e.amount), 0) as total_spent,
          (b.amount - COALESCE(SUM(e.amount), 0)) as remaining,
          CASE 
            WHEN b.amount > 0 THEN (COALESCE(SUM(e.amount), 0) / b.amount) * 100 
            ELSE 0 
          END as progress_percentage
        FROM budgets b
        LEFT JOIN expenses e ON b.id = e.budget_id
        WHERE b.user_id = ? AND b.status = 'active'
        GROUP BY b.id
        ORDER BY b.created_at DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting budget summary:', error.message);
      throw error;
    }
  }

  static async getActiveBudgetsByCategory(userId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          category,
          COUNT(*) as budget_count,
          SUM(amount) as total_budgeted,
          SUM(COALESCE(spent.total_spent, 0)) as total_spent
        FROM budgets b
        LEFT JOIN (
          SELECT budget_id, SUM(amount) as total_spent
          FROM expenses
          GROUP BY budget_id
        ) spent ON b.id = spent.budget_id
        WHERE b.user_id = ? AND b.status = 'active'
        GROUP BY category
        ORDER BY total_budgeted DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting budgets by category:', error.message);
      throw error;
    }
  }

  static async createRecurringBudgets() {
    try {
      // Find budgets that need to be renewed
      const [expiredBudgets] = await pool.query(`
        SELECT * FROM budgets 
        WHERE is_recurring = TRUE 
        AND status = 'active' 
        AND end_date < CURDATE()
      `);

      const newBudgets = [];

      for (const budget of expiredBudgets) {
        // Calculate new dates based on period
        let newStartDate = new Date(budget.end_date);
        let newEndDate = new Date(budget.end_date);

        switch (budget.period) {
          case 'weekly':
            newStartDate.setDate(newStartDate.getDate() + 1);
            newEndDate.setDate(newEndDate.getDate() + 7);
            break;
          case 'monthly':
            newStartDate.setDate(newStartDate.getDate() + 1);
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            break;
          case 'yearly':
            newStartDate.setDate(newStartDate.getDate() + 1);
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            break;
        }

        // Create new budget
        const newBudgetData = {
          user_id: budget.user_id,
          name: budget.name,
          category: budget.category,
          amount: budget.amount,
          period: budget.period,
          start_date: newStartDate.toISOString().split('T')[0],
          end_date: newEndDate.toISOString().split('T')[0],
          is_recurring: true
        };

        const newBudget = await this.create(newBudgetData);
        newBudgets.push(newBudget);

        // Mark old budget as completed
        await pool.query(
          'UPDATE budgets SET status = ? WHERE id = ?',
          ['completed', budget.id]
        );
      }

      return newBudgets;
    } catch (error) {
      console.error('Error creating recurring budgets:', error.message);
      throw error;
    }
  }
}

module.exports = Budget;