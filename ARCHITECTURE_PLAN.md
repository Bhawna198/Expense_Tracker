# Expense Tracker to Budget Management System - Architecture Plan

## Overview
Transform the existing expense tracker into a comprehensive budget management system with premium subscription tiers and advanced features.

## Database Schema Design

### New Tables to Add

```sql
-- Subscription tiers and user subscriptions
CREATE TABLE subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- 'Basic', 'Premium', 'Pro'
  price DECIMAL(10,2) NOT NULL,
  features JSON NOT NULL,
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_subscriptions (
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

-- Budget system
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
);

-- Link expenses to budgets
ALTER TABLE expenses ADD COLUMN budget_id INT NULL;
ALTER TABLE expenses ADD FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL;

-- Bill reminders
CREATE TABLE bill_reminders (
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

-- AI insights and recommendations
CREATE TABLE ai_insights (
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
```

## Application Architecture

### Core System Flow
1. **Budget Creation**: Users create budgets with allocated amounts
2. **Expense Allocation**: Expenses are assigned to specific budgets
3. **Progress Tracking**: Visual indicators show budget usage
4. **Premium Features**: Tier-based access to advanced functionality

### New Page Structure
1. **Enhanced Dashboard** - Budget overview with progress bars
2. **Reports Page** - Charts and analytics from dashboard
3. **Expenses Page** - Comprehensive list with filtering
4. **Budgets Page** - Budget management interface
5. **Bills Page** - Bill reminder management
6. **Subscription Page** - Plan selection and payment
7. **AI Insights Page** - Personalized recommendations

## Subscription Tiers

### Basic ($9/month)
- Unlimited budgets
- Bill reminders
- Basic reports (pie charts, monthly trends)
- Standard categories

### Premium ($19/month)
- All Basic features
- AI insights and recommendations
- Recurring budgets (weekly/monthly/yearly)
- Advanced analytics
- Budget vs actual comparisons

### Pro ($29/month)
- All Premium features
- Data export (CSV/PDF)
- Priority support
- Custom categories
- Advanced filtering and search

## Key Features Implementation

### Budget System Flow
1. User creates budget (e.g., "Food - $1000/month")
2. When adding expenses, user selects which budget to allocate to
3. Progress bar shows remaining budget amount
4. Visual indicators warn when approaching budget limits

### AI Insights Examples
- "You've spent 40% more on dining out this month"
- "Consider reducing entertainment budget by $200 to meet savings goal"
- "Your grocery spending pattern suggests bulk buying on weekends saves 15%"

### Bill Reminder Features
- Email/in-app notifications
- Recurring bill templates
- Mark as paid functionality
- Integration with expense tracking

## Technical Implementation Strategy

### Backend Enhancements
- New model classes: Budget.js, Subscription.js, BillReminder.js, AIInsight.js
- Enhanced API routes with premium feature checks
- Stripe webhook handling for subscription events
- AI insight generation algorithms

### Frontend Enhancements
- New React components for budget management
- Enhanced navigation with dropdown menus
- Progress bar components for budget tracking
- Subscription management interface
- Premium feature access controls

### Integration Points
- Stripe for payment processing
- Email service for bill reminders
- Chart.js for enhanced visualizations
- JWT tokens for premium feature access

## File Structure Changes

### Backend New Files
```
backend/
├── models/
│   ├── Budget.js
│   ├── Subscription.js
│   ├── BillReminder.js
│   └── AIInsight.js
├── routes/
│   ├── budgets.js
│   ├── subscriptions.js
│   ├── bills.js
│   └── insights.js
├── services/
│   ├── stripeService.js
│   ├── aiService.js
│   └── emailService.js
└── middleware/
    └── premiumCheck.js
```

### Frontend New Files
```
frontend/src/
├── pages/
│   ├── Reports.js
│   ├── Expenses.js
│   ├── Budgets.js
│   ├── Bills.js
│   ├── Subscription.js
│   └── AIInsights.js
├── components/
│   ├── BudgetCard.js
│   ├── BudgetForm.js
│   ├── ProgressBar.js
│   ├── BillReminder.js
│   ├── SubscriptionPlan.js
│   ├── InsightCard.js
│   └── PremiumFeature.js
└── styles/
    ├── Budget.css
    ├── Reports.css
    ├── Bills.css
    └── Subscription.css
```

## Implementation Priority

1. **Phase 1**: Database schema and Budget system
2. **Phase 2**: Enhanced navigation and Reports page
3. **Phase 3**: Subscription system with Stripe integration
4. **Phase 4**: Bill reminders and AI insights
5. **Phase 5**: Premium feature restrictions and testing

This architecture provides a scalable foundation for the budget management system while maintaining existing expense tracking functionality.