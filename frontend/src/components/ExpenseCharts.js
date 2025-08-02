import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { generateChartColors } from '../utils/helpers';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ExpenseCharts = ({ categoryData, monthlyData }) => {
  // Prepare data for category pie chart
  const prepareCategoryData = () => {
    if (!categoryData || !categoryData.length) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e0e0e0'],
          borderWidth: 1
        }]
      };
    }

    const labels = categoryData.map(item => item.category);
    const data = categoryData.map(item => item.total);
    const backgroundColor = generateChartColors(labels.length);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 1
      }]
    };
  };

  // Prepare data for monthly bar chart
  const prepareMonthlyData = () => {
    if (!monthlyData || !monthlyData.length) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Monthly Expenses',
          data: [0],
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C',
          borderWidth: 1
        }]
      };
    }

    const labels = monthlyData.map(item => item.label);
    const data = monthlyData.map(item => item.total);

    return {
      labels,
      datasets: [{
        label: 'Monthly Expenses',
        data,
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 1
      }]
    };
  };

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  return (
    <div className="expense-charts">
      <div className="chart-container">
        <h3>Expenses by Category</h3>
        <div className="pie-chart">
          <Pie data={prepareCategoryData()} options={pieOptions} />
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Monthly Expenses</h3>
        <div className="bar-chart">
          <Bar data={prepareMonthlyData()} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;