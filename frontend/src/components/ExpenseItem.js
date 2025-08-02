import React from 'react';
import { formatCurrency, formatDate } from '../utils/helpers';

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const { id, amount, description, category, date } = expense;
  
  // Get category color based on category name (for visual distinction)
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Food & Dining': '#FF5722',
      'Transportation': '#2196F3',
      'Housing': '#9C27B0',
      'Utilities': '#FFC107',
      'Entertainment': '#4CAF50',
      'Shopping': '#E91E63',
      'Healthcare': '#00BCD4',
      'Education': '#3F51B5',
      'Travel': '#8BC34A',
      'Personal Care': '#FF9800',
      'Gifts & Donations': '#795548',
      'Other': '#607D8B'
    };
    
    return categoryColors[category] || '#607D8B';
  };
  
  return (
    <div className="expense-item">
      <div className="expense-item-left">
        <div 
          className="expense-category-indicator" 
          style={{ backgroundColor: getCategoryColor(category) }}
        ></div>
        <div className="expense-details">
          <h4 className="expense-description">{description}</h4>
          <div className="expense-meta">
            <span className="expense-category">{category}</span>
            <span className="expense-date">{formatDate(date)}</span>
          </div>
        </div>
      </div>
      
      <div className="expense-item-right">
        <div className="expense-amount">{formatCurrency(amount)}</div>
        <div className="expense-actions">
          <button 
            className="btn-icon edit-btn" 
            onClick={() => onEdit(expense)}
            aria-label="Edit expense"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="btn-icon delete-btn" 
            onClick={() => onDelete(id)}
            aria-label="Delete expense"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;