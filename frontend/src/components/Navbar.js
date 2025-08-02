import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <i className="fas fa-wallet"></i>
            <span>ExpenseTracker</span>
          </Link>

          <div className="auth-buttons">
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <i className="fas fa-wallet"></i>
          <span>ExpenseTracker</span>
        </Link>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </Link>

            <Link
              to="/budgets"
              className={`nav-link ${isActive('/budgets') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-chart-pie"></i>
              Budgets
            </Link>

            <Link
              to="/expenses"
              className={`nav-link ${isActive('/expenses') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-receipt"></i>
              Expenses
            </Link>

            <Link
              to="/reports"
              className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-chart-bar"></i>
              Reports
            </Link>

            <Link
              to="/subscription"
              className={`nav-link ${isActive('/subscription') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-crown"></i>
              Subscription
            </Link>
          </div>

          <div className="navbar-user">
            <div className="user-info">
              <span className="welcome-text">Welcome, {user?.name}</span>
              <span className="user-plan">Free Plan</span>
            </div>
            <button className="btn btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;