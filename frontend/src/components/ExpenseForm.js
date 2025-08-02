import React, { useState, useEffect } from 'react';
import { getExpenseCategories, formatDate } from '../utils/helpers';

const ExpenseForm = ({ onSubmit, initialData, buttonText = 'Save Expense', onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: formatDate(new Date())
  });
  const [errors, setErrors] = useState({});
  
  // If initialData is provided, populate the form (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount,
        description: initialData.description,
        category: initialData.category,
        date: formatDate(new Date(initialData.date))
      });
    }
  }, [initialData]);

  const categories = getExpenseCategories();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert amount to number before submitting
      const submittedData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      onSubmit(submittedData);
      
      // Reset form if not editing
      if (!initialData) {
        setFormData({
          amount: '',
          description: '',
          category: '',
          date: formatDate(new Date())
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="form-group">
        <label htmlFor="amount">Amount ($)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0.01"
          placeholder="0.00"
          className={errors.amount ? 'error' : ''}
        />
        {errors.amount && <div className="error-message">{errors.amount}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What did you spend on?"
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <div className="error-message">{errors.description}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={errors.category ? 'error' : ''}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {errors.category && <div className="error-message">{errors.category}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? 'error' : ''}
        />
        {errors.date && <div className="error-message">{errors.date}</div>}
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;