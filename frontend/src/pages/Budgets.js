import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BudgetCard from '../components/BudgetCard';
import BudgetForm from '../components/BudgetForm';
import axios from 'axios';
import '../styles/Budget.css';

const Budgets = () => {
  const { user } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [filter, setFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, [filter]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/budgets/summary?status=${filter}`);
      setBudgets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (budgetData) => {
    try {
      await axios.post('http://localhost:5000/api/budgets', budgetData);
      setShowForm(false);
      fetchBudgets();
    } catch (err) {
      setError('Failed to create budget');
      console.error('Error creating budget:', err);
    }
  };

  const handleUpdateBudget = async (budgetData) => {
    try {
      await axios.put(`http://localhost:5000/api/budgets/${editingBudget.id}`, budgetData);
      setEditingBudget(null);
      setShowForm(false);
      fetchBudgets();
    } catch (err) {
      setError('Failed to update budget');
      console.error('Error updating budget:', err);
    }
  };

  const handleDeleteBudget = async (budget) => {
    if (window.confirm(`Are you sure you want to delete "${budget.name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`http://localhost:5000/api/budgets/${budget.id}`);
        fetchBudgets();
      } catch (err) {
        setError('Failed to delete budget');
        console.error('Error deleting budget:', err);
      }
    }
  };

  const handlePauseBudget = async (budget) => {
    try {
      await axios.post(`http://localhost:5000/api/budgets/${budget.id}/pause`);
      fetchBudgets();
    } catch (err) {
      setError('Failed to update budget status');
      console.error('Error updating budget status:', err);
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalBudgeted = () => {
    return filteredBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
  };

  const getTotalSpent = () => {
    return filteredBudgets.reduce((sum, budget) => sum + parseFloat(budget.total_spent || 0), 0);
  };

  const getTotalRemaining = () => {
    return getTotalBudgeted() - getTotalSpent();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading budgets...</div>;
  }

  return (
    <div className="budgets-container">
      <Navbar />
      <div className="budgets-header">
        <div className="header-content">
          <h1>Budget Management</h1>
          <p>Track your spending against your budgets</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Create Budget
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Budget Summary */}
      <div className="budget-summary">
        <div className="summary-card">
          <h3>Total Budgeted</h3>
          <span className="summary-amount">{formatCurrency(getTotalBudgeted())}</span>
        </div>
        <div className="summary-card">
          <h3>Total Spent</h3>
          <span className="summary-amount spent">{formatCurrency(getTotalSpent())}</span>
        </div>
        <div className="summary-card">
          <h3>Remaining</h3>
          <span className={`summary-amount ${getTotalRemaining() < 0 ? 'negative' : 'positive'}`}>
            {formatCurrency(getTotalRemaining())}
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="budgets-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({budgets.filter(b => b.status === 'active').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'paused' ? 'active' : ''}`}
            onClick={() => setFilter('paused')}
          >
            Paused ({budgets.filter(b => b.status === 'paused').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({budgets.length})
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Budget Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <BudgetForm
              budget={editingBudget}
              onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
              onCancel={handleCancelForm}
              isEditing={!!editingBudget}
            />
          </div>
        </div>
      )}

      {/* Budget Cards */}
      <div className="budgets-grid">
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
              onPause={handlePauseBudget}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No budgets found</h3>
            <p>
              {searchTerm 
                ? `No budgets match "${searchTerm}"`
                : filter === 'active' 
                  ? "You don't have any active budgets yet."
                  : `No ${filter} budgets found.`
              }
            </p>
            {!searchTerm && filter === 'active' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Create Your First Budget
              </button>
            )}
          </div>
        )}
      </div>

      {/* Budget Tips */}
      {filteredBudgets.length > 0 && (
        <div className="budget-tips">
          <h3>💡 Budget Tips</h3>
          <ul>
            <li>Set realistic budget amounts based on your spending history</li>
            <li>Review and adjust your budgets monthly</li>
            <li>Use recurring budgets for consistent monthly expenses</li>
            <li>Track your progress regularly to stay on target</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Budgets;