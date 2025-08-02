import React from 'react';
import '../styles/Budget.css';

const BudgetCard = ({ budget, onEdit, onDelete, onPause }) => {
  const progressPercentage = Math.min((budget.total_spent / budget.amount) * 100, 100);
  const isOverBudget = budget.total_spent > budget.amount;
  const isNearLimit = progressPercentage >= 80 && !isOverBudget;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = () => {
    if (isOverBudget) return '#e74c3c';
    if (isNearLimit) return '#f39c12';
    return '#27ae60';
  };

  const getStatusText = () => {
    if (budget.status === 'paused') return 'Paused';
    if (isOverBudget) return 'Over Budget';
    if (isNearLimit) return 'Near Limit';
    return 'On Track';
  };

  return (
    <div className={`budget-card ${budget.status === 'paused' ? 'paused' : ''}`}>
      <div className="budget-header">
        <div className="budget-info">
          <h3 className="budget-name">{budget.name}</h3>
          <span className="budget-category">{budget.category}</span>
          <span className="budget-period">{budget.period}</span>
        </div>
        <div className="budget-actions">
          <button 
            className="btn-icon btn-edit" 
            onClick={() => onEdit(budget)}
            title="Edit Budget"
          >
            ✏️
          </button>
          <button 
            className="btn-icon btn-pause" 
            onClick={() => onPause(budget)}
            title={budget.status === 'active' ? 'Pause Budget' : 'Resume Budget'}
          >
            {budget.status === 'active' ? '⏸️' : '▶️'}
          </button>
          <button 
            className="btn-icon btn-delete" 
            onClick={() => onDelete(budget)}
            title="Delete Budget"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="budget-amounts">
        <div className="amount-item">
          <span className="amount-label">Budgeted</span>
          <span className="amount-value">{formatCurrency(budget.amount)}</span>
        </div>
        <div className="amount-item">
          <span className="amount-label">Spent</span>
          <span className="amount-value spent">{formatCurrency(budget.total_spent || 0)}</span>
        </div>
        <div className="amount-item">
          <span className="amount-label">Remaining</span>
          <span className={`amount-value ${budget.remaining < 0 ? 'negative' : 'positive'}`}>
            {formatCurrency(budget.remaining || budget.amount)}
          </span>
        </div>
      </div>

      <div className="budget-progress">
        <div className="progress-header">
          <span className="progress-label">Progress</span>
          <span className="progress-percentage">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(progressPercentage, 100)}%`,
              backgroundColor: getStatusColor()
            }}
          ></div>
        </div>
        <div className="progress-status" style={{ color: getStatusColor() }}>
          {getStatusText()}
        </div>
      </div>

      <div className="budget-dates">
        <span className="date-range">
          {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
        </span>
        {budget.is_recurring && (
          <span className="recurring-badge">🔄 Recurring</span>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;