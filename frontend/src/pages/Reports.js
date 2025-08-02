import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import '../styles/Reports.css';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
  const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });
  const [budgetVsActualData, setBudgetVsActualData] = useState({ labels: [], datasets: [] });
  const [trendData, setTrendData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, budgetsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses'),
        axios.get('http://localhost:5000/api/budgets/summary')
      ]);
      
      setExpenses(expensesRes.data);
      setBudgets(budgetsRes.data);
      prepareChartData(expensesRes.data, budgetsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (expenseData, budgetData) => {
    // Filter expenses based on date range
    const filteredExpenses = filterExpensesByDateRange(expenseData);

    // Category breakdown
    const categories = {};
    filteredExpenses.forEach(expense => {
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
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          hoverBackgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ]
        }
      ]
    });

    // Monthly trends
    const monthlyExpenses = {};
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (monthlyExpenses[monthYear]) {
        monthlyExpenses[monthYear] += parseFloat(expense.amount);
      } else {
        monthlyExpenses[monthYear] = parseFloat(expense.amount);
      }
    });

    setMonthlyData({
      labels: Object.keys(monthlyExpenses),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: Object.values(monthlyExpenses),
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          borderWidth: 2
        }
      ]
    });

    // Budget vs Actual
    const budgetComparison = budgetData.map(budget => ({
      name: budget.name,
      budgeted: parseFloat(budget.amount),
      spent: parseFloat(budget.total_spent || 0)
    }));

    setBudgetVsActualData({
      labels: budgetComparison.map(b => b.name),
      datasets: [
        {
          label: 'Budgeted',
          data: budgetComparison.map(b => b.budgeted),
          backgroundColor: '#4BC0C0',
          borderColor: '#4BC0C0',
          borderWidth: 2
        },
        {
          label: 'Actual Spent',
          data: budgetComparison.map(b => b.spent),
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          borderWidth: 2
        }
      ]
    });

    // Daily spending trend (last 30 days)
    const last30Days = getLast30Days();
    const dailySpending = {};
    
    last30Days.forEach(date => {
      dailySpending[date] = 0;
    });

    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      if (dailySpending.hasOwnProperty(expenseDate)) {
        dailySpending[expenseDate] += parseFloat(expense.amount);
      }
    });

    setTrendData({
      labels: Object.keys(dailySpending),
      datasets: [
        {
          label: 'Daily Spending',
          data: Object.values(dailySpending),
          borderColor: '#9966FF',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    });
  };

  const filterExpensesByDateRange = (expenses) => {
    const now = new Date();
    let startDate;

    switch (dateRange) {
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'thisyear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });
  };

  const getLast30Days = () => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getTotalSpent = () => {
    const filteredExpenses = filterExpensesByDateRange(expenses);
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const getAverageDaily = () => {
    const filteredExpenses = filterExpensesByDateRange(expenses);
    const days = dateRange === 'last7days' ? 7 : dateRange === 'last30days' ? 30 : 90;
    return getTotalSpent() / days;
  };

  const getTopCategory = () => {
    const filteredExpenses = filterExpensesByDateRange(expenses);
    const categories = {};
    
    filteredExpenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + parseFloat(expense.amount);
    });

    const topCategory = Object.entries(categories).reduce((a, b) => 
      categories[a[0]] > categories[b[0]] ? a : b, ['', 0]
    );

    return { name: topCategory[0], amount: topCategory[1] };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="reports-container">
        <Navbar />
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  const topCategory = getTopCategory();

  return (
    <div className="reports-container">
      <Navbar />
      
      <div className="reports-header">
        <div className="header-content">
          <h1>Financial Reports</h1>
          <p>Analyze your spending patterns and budget performance</p>
        </div>
        
        <div className="date-range-selector">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="thisyear">This Year</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Spent</h3>
            <span className="card-value">{formatCurrency(getTotalSpent())}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Daily Average</h3>
            <span className="card-value">{formatCurrency(getAverageDaily())}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">🏆</div>
          <div className="card-content">
            <h3>Top Category</h3>
            <span className="card-value">{topCategory.name}</span>
            <span className="card-subvalue">{formatCurrency(topCategory.amount)}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Active Budgets</h3>
            <span className="card-value">{budgets.filter(b => b.status === 'active').length}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          {categoryData.labels.length > 0 ? (
            <Pie data={categoryData} options={{ responsive: true, maintainAspectRatio: false }} />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        <div className="chart-card">
          <h3>Monthly Trends</h3>
          {monthlyData.labels.length > 0 ? (
            <Bar 
              data={monthlyData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount ($)' }
                  }
                }
              }}
            />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        <div className="chart-card">
          <h3>Budget vs Actual</h3>
          {budgetVsActualData.labels.length > 0 ? (
            <Bar 
              data={budgetVsActualData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount ($)' }
                  }
                }
              }}
            />
          ) : (
            <p className="no-data">No budgets available</p>
          )}
        </div>

        <div className="chart-card">
          <h3>Daily Spending Trend</h3>
          {trendData.labels.length > 0 ? (
            <Line 
              data={trendData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount ($)' }
                  },
                  x: {
                    title: { display: true, text: 'Date' }
                  }
                }
              }}
            />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h3>💡 Financial Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Spending Pattern</h4>
            <p>
              Your highest spending category is <strong>{topCategory.name}</strong> with 
              {formatCurrency(topCategory.amount)} in the selected period.
            </p>
          </div>
          
          <div className="insight-card">
            <h4>Budget Performance</h4>
            <p>
              You have {budgets.filter(b => b.total_spent > b.amount).length} budgets 
              that are over limit out of {budgets.length} total budgets.
            </p>
          </div>
          
          <div className="insight-card">
            <h4>Recommendation</h4>
            <p>
              Consider setting up a budget for your top spending category to better 
              control your expenses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;