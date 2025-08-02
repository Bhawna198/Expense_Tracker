-- Update database schema for budget management system
-- Run this script to add new tables and modify existing ones

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSON NOT NULL,
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  stripe_subscription_id VARCHAR(255),
  status ENUM('active', 'canceled', 'past_due') DEFAULT 'active',
  current_period_start DATE,
  current_period_end DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Budgets table
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
);

-- Add budget_id to expenses table if it doesn't exist
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS budget_id INT NULL;
ALTER TABLE expenses ADD CONSTRAINT fk_expense_budget 
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL;

-- Bill reminders table
CREATE TABLE IF NOT EXISTS bill_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2),
  due_date DATE NOT NULL,
  frequency ENUM('once', 'weekly', 'monthly', 'yearly') DEFAULT 'once',
  category VARCHAR(100),
  is_paid BOOLEAN DEFAULT FALSE,
  reminder_days_before INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  insight_type ENUM('spending_pattern', 'budget_recommendation', 'saving_tip') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, features, stripe_price_id) VALUES
('Basic', 9.00, '{"budgets": "unlimited", "bill_reminders": true, "basic_reports": true, "categories": "standard"}', 'price_basic_monthly'),
('Premium', 19.00, '{"budgets": "unlimited", "bill_reminders": true, "basic_reports": true, "ai_insights": true, "recurring_budgets": true, "advanced_analytics": true, "categories": "standard"}', 'price_premium_monthly'),
('Pro', 29.00, '{"budgets": "unlimited", "bill_reminders": true, "basic_reports": true, "ai_insights": true, "recurring_budgets": true, "advanced_analytics": true, "data_export": true, "priority_support": true, "custom_categories": true, "categories": "custom"}', 'price_pro_monthly')
ON DUPLICATE KEY UPDATE 
  price = VALUES(price),
  features = VALUES(features),
  stripe_price_id = VALUES(stripe_price_id);