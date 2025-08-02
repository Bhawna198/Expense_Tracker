import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Subscription.css';

const Subscription = () => {
  const { user } = useContext(AuthContext);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 9,
      yearlyPrice: 90,
      description: 'Perfect for personal budget management',
      features: [
        'Unlimited budgets',
        'Bill reminders',
        'Basic reports and charts',
        'Standard expense categories',
        'Email support',
        'Mobile app access'
      ],
      popular: false,
      color: '#4299e1'
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 19,
      yearlyPrice: 190,
      description: 'Advanced features for serious budgeters',
      features: [
        'Everything in Basic',
        'AI insights and recommendations',
        'Recurring budgets (weekly/monthly/yearly)',
        'Advanced analytics and trends',
        'Budget vs actual comparisons',
        'Priority email support',
        'Export data (CSV/PDF)',
        'Custom spending alerts'
      ],
      popular: true,
      color: '#38a169'
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 29,
      yearlyPrice: 290,
      description: 'Complete financial management solution',
      features: [
        'Everything in Premium',
        'Custom expense categories',
        'Advanced data export options',
        'Priority support with phone access',
        'Custom integrations (API access)',
        'Multi-currency support',
        'Team collaboration features',
        'Advanced security features',
        'Dedicated account manager'
      ],
      popular: false,
      color: '#805ad5'
    }
  ];

  const currentPlan = 'free'; // This would come from user context in real app

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async (plan) => {
    setLoading(true);
    
    // In a real app, this would integrate with Stripe
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Redirecting to payment for ${plan.name} plan...`);
      // Here you would redirect to Stripe Checkout or handle payment
      
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return monthlyCost - yearlyCost;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="subscription-container">
      <Navbar />
      
      <div className="subscription-header">
        <div className="header-content">
          <h1>Choose Your Plan</h1>
          <p>Unlock powerful features to take control of your finances</p>
        </div>
        
        <div className="billing-toggle">
          <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={billingCycle === 'yearly'}
              onChange={(e) => setBillingCycle(e.target.checked ? 'yearly' : 'monthly')}
            />
            <span className="slider"></span>
          </label>
          <span className={billingCycle === 'yearly' ? 'active' : ''}>
            Yearly <span className="savings-badge">Save up to 17%</span>
          </span>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="current-plan-status">
        <div className="status-card">
          <h3>Current Plan</h3>
          <div className="current-plan-info">
            <span className="plan-name">Free Plan</span>
            <span className="plan-features">Basic expense tracking</span>
          </div>
          <div className="upgrade-prompt">
            <p>Upgrade to unlock advanced budgeting features!</p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="pricing-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`pricing-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            
            <div className="plan-header">
              <h3 className="plan-name" style={{ color: plan.color }}>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="plan-pricing">
              <div className="price-display">
                <span className="currency">$</span>
                <span className="price">{getPrice(plan)}</span>
                <span className="period">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
              </div>
              
              {billingCycle === 'yearly' && (
                <div className="savings-info">
                  Save {formatPrice(getSavings(plan))} per year
                </div>
              )}
            </div>

            <div className="plan-features">
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className={`subscribe-btn ${plan.popular ? 'popular-btn' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSubscribe(plan);
              }}
              disabled={loading}
              style={{ backgroundColor: plan.color }}
            >
              {loading ? 'Processing...' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="feature-comparison">
        <h2>Feature Comparison</h2>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Features</th>
                <th>Free</th>
                <th>Basic</th>
                <th>Premium</th>
                <th>Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Expense Tracking</td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>Basic Charts</td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>Unlimited Budgets</td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>Bill Reminders</td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>AI Insights</td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>Recurring Budgets</td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>Advanced Analytics</td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>Data Export</td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>Custom Categories</td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>Priority Support</td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>API Access</td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="cross">✗</span></td>
                <td><span className="check">✓</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change my plan anytime?</h4>
            <p>Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>
          
          <div className="faq-item">
            <h4>Is there a free trial?</h4>
            <p>Yes! All paid plans come with a 14-day free trial. No credit card required to start.</p>
          </div>
          
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
          </div>
          
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Absolutely! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          
          <div className="faq-item">
            <h4>Is my data secure?</h4>
            <p>Yes, we use bank-level encryption and security measures to protect your financial data. We never share your information with third parties.</p>
          </div>
          
          <div className="faq-item">
            <h4>Do you offer refunds?</h4>
            <p>We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment.</p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="trust-section">
        <div className="trust-indicators">
          <div className="trust-item">
            <div className="trust-icon">🔒</div>
            <h4>Bank-Level Security</h4>
            <p>256-bit SSL encryption</p>
          </div>
          
          <div className="trust-item">
            <div className="trust-icon">💳</div>
            <h4>Secure Payments</h4>
            <p>Powered by Stripe</p>
          </div>
          
          <div className="trust-item">
            <div className="trust-icon">🛡️</div>
            <h4>Privacy Protected</h4>
            <p>GDPR compliant</p>
          </div>
          
          <div className="trust-item">
            <div className="trust-icon">⭐</div>
            <h4>Trusted by 10k+ Users</h4>
            <p>4.8/5 average rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;