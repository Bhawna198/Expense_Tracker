import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import '../styles/Dashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgets, setBudgets] = useState([]);
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
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: []
  });
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: []
  });

  // Fetch expenses and budgets when component mounts
  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
  }, []);

  // Prepare chart data when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      prepareChartData();
    }
  }, [expenses]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/expenses');
      setExpenses(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch expenses');
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/budgets/summary');
      setBudgets(res.data);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    }
  };

  const prepareChartData = () => {
    // Prepare category data for pie chart
    const categories = {};
    expenses.forEach(expense => {
      if (categories[expense.category]) {
        categories[expense.category] += parseFloat(expense.amount);
      } else {
        categories[expense.category] = parseFloat(expense.amount);
      }
    });

    setCategoryData({
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }
      ]
    });

    // Prepare monthly data for bar chart
    const months = {};
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (months[monthYear]) {
        months[monthYear] += parseFloat(expense.amount);
      } else {
        months[monthYear] = parseFloat(expense.amount);
      }
    });

    setMonthlyData({
      labels: Object.keys(months),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: Object.values(months),
          backgroundColor: '#36A2EB'
        }
      ]
    });
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <Navbar />
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome back, {user?.name}!</span>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Budget Overview */}
        {budgets.length > 0 && (
          <div className="budget-overview">
            <h3>Budget Overview</h3>
            <div className="budget-cards-mini">
              {budgets.slice(0, 3).map(budget => {
                const progressPercentage = Math.min((budget.total_spent / budget.amount) * 100, 100);
                const isOverBudget = budget.total_spent > budget.amount;
                return (
                  <div key={budget.id} className="budget-card-mini">
                    <div className="budget-mini-header">
                      <span className="budget-mini-name">{budget.name}</span>
                      <span className={`budget-mini-status ${isOverBudget ? 'over' : 'good'}`}>
                        {isOverBudget ? 'Over Budget' : 'On Track'}
                      </span>
                    </div>
                    <div className="budget-mini-progress">
                      <div className="progress-bar-mini">
                        <div
                          className="progress-fill-mini"
                          style={{
                            width: `${Math.min(progressPercentage, 100)}%`,
                            backgroundColor: isOverBudget ? '#e74c3c' : '#27ae60'
                          }}
                        ></div>
                      </div>
                      <span className="progress-text-mini">
                        ${budget.total_spent || 0} / ${budget.amount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {budgets.length > 3 && (
              <p className="budget-overview-note">
                Showing 3 of {budgets.length} budgets. <a href="/budgets">View all budgets</a>
              </p>
            )}
          </div>
        )}

        <div className="expense-actions">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? 'Cancel' : 'Add Expense'}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {showAddForm && (
          <div className="expense-form-container">
            <h3>Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="expense-form">
              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
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
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Housing">Housing</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>

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
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success">Add Expense</button>
            </form>
          </div>
        )}

        {showEditForm && currentExpense && (
          <div className="expense-form-container">
            <h3>Edit Expense</h3>
            <form onSubmit={handleUpdateExpense} className="expense-form">
              <div className="form-group">
                <label htmlFor="edit-amount">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  id="edit-amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <input
                  type="text"
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Housing">Housing</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-budget_id">Budget (Optional)</label>
                <select
                  id="edit-budget_id"
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
                <label htmlFor="edit-date">Date</label>
                <input
                  type="date"
                  id="edit-date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">Update</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditForm(false);
                    setCurrentExpense(null);
                  }} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="dashboard-charts">
          <div className="chart-container">
            <h3>Expenses by Category</h3>
            {expenses.length > 0 ? (
              <Pie data={categoryData} />
            ) : (
              <p>No data to display</p>
            )}
          </div>
          
          <div className="chart-container">
            <h3>Monthly Expenses</h3>
            {expenses.length > 0 ? (
              <Bar 
                data={monthlyData} 
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount ($)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Month/Year'
                      }
                    }
                  }
                }}
              />
            ) : (
              <p>No data to display</p>
            )}
          </div>
        </div>

        <div className="expenses-list-container">
          <h3>Recent Expenses</h3>
          {expenses.length > 0 ? (
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
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td>
                      {expense.budget_id ? (
                        <span className="budget-tag">
                          {budgets.find(b => b.id === expense.budget_id)?.name || 'Unknown Budget'}
                        </span>
                      ) : (
                        <span className="no-budget">No Budget</span>
                      )}
                    </td>
                    <td>${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => handleEditClick(expense)} 
                        className="btn-icon btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(expense.id)} 
                        className="btn-icon btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No expenses found. Add some expenses to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;