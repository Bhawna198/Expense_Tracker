import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/Expenses.css';

const Expenses = () => {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    budget_id: ''
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/expenses');
      setExpenses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/budgets/summary');
      setBudgets(response.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/expenses', formData);
      setFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        budget_id: ''
      });
      setShowAddForm(false);
      fetchExpenses();
    } catch (err) {
      setError('Failed to add expense');
    }
  };

  const handleEditClick = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      budget_id: expense.budget_id || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/expenses/${currentExpense.id}`, formData);
      setShowEditForm(false);
      setCurrentExpense(null);
      fetchExpenses();
    } catch (err) {
      setError('Failed to update expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`http://localhost:5000/api/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        setError('Failed to delete expense');
      }
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setCurrentExpense(null);
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      budget_id: ''
    });
  };

  // Filter and sort expenses
  const getFilteredExpenses = () => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      
      const matchesBudget = budgetFilter === 'all' || 
                           (budgetFilter === 'no-budget' && !expense.budget_id) ||
                           expense.budget_id === parseInt(budgetFilter);

      const matchesDate = dateFilter === 'all' || filterByDate(expense.date, dateFilter);

      return matchesSearch && matchesCategory && matchesBudget && matchesDate;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default: // date
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filterByDate = (expenseDate, filter) => {
    const date = new Date(expenseDate);
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= monthAgo;
      case 'year':
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  // Pagination
  const filteredExpenses = getFilteredExpenses();
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const getUniqueCategories = () => {
    return [...new Set(expenses.map(expense => expense.category))];
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const categories = [
    'Food', 'Transportation', 'Housing', 'Utilities', 
    'Entertainment', 'Healthcare', 'Shopping', 'Education', 
    'Travel', 'Other'
  ];

  if (loading) {
    return (
      <div className="expenses-container">
        <Navbar />
        <div className="loading">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="expenses-container">
      <Navbar />
      
      <div className="expenses-header">
        <div className="header-content">
          <h1>Expense Management</h1>
          <p>Track and manage all your expenses</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          + Add Expense
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Stats */}
      <div className="expense-stats">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <span className="stat-value">{filteredExpenses.length}</span>
        </div>
        <div className="stat-card">
          <h3>Total Amount</h3>
          <span className="stat-value">{formatCurrency(getTotalAmount())}</span>
        </div>
        <div className="stat-card">
          <h3>Average</h3>
          <span className="stat-value">
            {formatCurrency(filteredExpenses.length > 0 ? getTotalAmount() / filteredExpenses.length : 0)}
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="expenses-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-section">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Budgets</option>
            <option value="no-budget">No Budget</option>
            {budgets.map(budget => (
              <option key={budget.id} value={budget.id}>{budget.name}</option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="filter-select"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
            <option value="description-asc">Description (A-Z)</option>
            <option value="category-asc">Category (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Expense Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="expense-form-container">
              <div className="form-header">
                <h3>{showEditForm ? 'Edit Expense' : 'Add New Expense'}</h3>
                <button className="btn-close" onClick={handleCancelForm}>×</button>
              </div>

              <form onSubmit={showEditForm ? handleUpdateExpense : handleAddExpense} className="expense-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="amount">Amount ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="budget_id">Budget (Optional)</label>
                    <select
                      id="budget_id"
                      name="budget_id"
                      value={formData.budget_id}
                      onChange={handleInputChange}
                    >
                      <option value="">No Budget</option>
                      {budgets.filter(b => b.status === 'active').map(budget => (
                        <option key={budget.id} value={budget.id}>
                          {budget.name} (${budget.remaining || budget.amount} remaining)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {showEditForm ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="expenses-table-container">
        {paginatedExpenses.length > 0 ? (
          <>
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>
                      <span className="category-tag">{expense.category}</span>
                    </td>
                    <td>
                      {expense.budget_id ? (
                        <span className="budget-tag">
                          {budgets.find(b => b.id === expense.budget_id)?.name || 'Unknown Budget'}
                        </span>
                      ) : (
                        <span className="no-budget">No Budget</span>
                      )}
                    </td>
                    <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                    <td>
                      <button 
                        onClick={() => handleEditClick(expense)} 
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(expense.id)} 
                        className="btn-icon btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {currentPage} of {totalPages} ({filteredExpenses.length} total)
                </span>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No expenses found</h3>
            <p>
              {searchTerm || categoryFilter !== 'all' || budgetFilter !== 'all' || dateFilter !== 'all'
                ? "No expenses match your current filters."
                : "You haven't added any expenses yet."
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && budgetFilter === 'all' && dateFilter === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                Add Your First Expense
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;