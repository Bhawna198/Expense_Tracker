import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API calls
export const authAPI = {
  register: userData => api.post('/auth/register', userData),
  login: userData => api.post('/auth/login', userData),
  getUser: () => api.get('/auth/user')
};

// Expenses API calls
export const expensesAPI = {
  getAll: (page = 1, limit = 50) => api.get(`/expenses?page=${page}&limit=${limit}`),
  getById: id => api.get(`/expenses/${id}`),
  create: expenseData => api.post('/expenses', expenseData),
  update: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  delete: id => api.delete(`/expenses/${id}`),
  getMonthlyTotal: (year, month) => api.get(`/expenses/summary/monthly?year=${year}&month=${month}`),
  getCategorySummary: (startDate, endDate) => api.get(`/expenses/summary/category?startDate=${startDate}&endDate=${endDate}`)
};