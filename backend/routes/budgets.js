const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

// @route   POST api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, category, amount, period, start_date, end_date, is_recurring } = req.body;

  // Validation
  if (!name || !category || !amount || !start_date || !end_date) {
    return res.status(400).json({ msg: 'Please enter all required fields' });
  }

  if (amount <= 0) {
    return res.status(400).json({ msg: 'Amount must be greater than 0' });
  }

  if (new Date(start_date) >= new Date(end_date)) {
    return res.status(400).json({ msg: 'End date must be after start date' });
  }

  try {
    const budgetData = {
      user_id: req.user.id,
      name,
      category,
      amount: parseFloat(amount),
      period: period || 'monthly',
      start_date,
      end_date,
      is_recurring: is_recurring || false
    };

    const budget = await Budget.create(budgetData);
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/budgets
// @desc    Get all budgets for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const status = req.query.status || 'active';
    const budgets = await Budget.findByUserId(req.user.id, status);
    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/budgets/summary
// @desc    Get budget summary with spending data
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const budgetSummary = await Budget.getBudgetSummary(req.user.id);
    res.json(budgetSummary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/budgets/category-summary
// @desc    Get budget summary by category
// @access  Private
router.get('/category-summary', auth, async (req, res) => {
  try {
    const categorySummary = await Budget.getActiveBudgetsByCategory(req.user.id);
    res.json(categorySummary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/budgets/:id
// @desc    Get a budget by ID with expenses
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.getBudgetWithExpenses(req.params.id, req.user.id);
    
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, category, amount, period, start_date, end_date, is_recurring, status } = req.body;

  // Validation
  if (!name || !category || !amount || !start_date || !end_date) {
    return res.status(400).json({ msg: 'Please enter all required fields' });
  }

  if (amount <= 0) {
    return res.status(400).json({ msg: 'Amount must be greater than 0' });
  }

  if (new Date(start_date) >= new Date(end_date)) {
    return res.status(400).json({ msg: 'End date must be after start date' });
  }

  try {
    // Check if budget exists and belongs to user
    const existingBudget = await Budget.findById(req.params.id, req.user.id);
    
    if (!existingBudget) {
      return res.status(404).json({ msg: 'Budget not found or not authorized' });
    }
    
    const budgetData = {
      name,
      category,
      amount: parseFloat(amount),
      period: period || 'monthly',
      start_date,
      end_date,
      is_recurring: is_recurring || false,
      status: status || 'active'
    };
    
    const updatedBudget = await Budget.update(req.params.id, req.user.id, budgetData);
    res.json(updatedBudget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Budget.delete(req.params.id, req.user.id);
    
    if (!result) {
      return res.status(404).json({ msg: 'Budget not found or not authorized' });
    }
    
    res.json({ msg: 'Budget removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/budgets/:id/pause
// @desc    Pause/unpause a budget
// @access  Private
router.post('/:id/pause', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id, req.user.id);
    
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found or not authorized' });
    }
    
    const newStatus = budget.status === 'active' ? 'paused' : 'active';
    const updatedBudget = await Budget.update(
      req.params.id, 
      req.user.id, 
      { ...budget, status: newStatus }
    );
    
    res.json(updatedBudget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/budgets/create-recurring
// @desc    Create recurring budgets (called by cron job)
// @access  Private (should be called by system)
router.post('/create-recurring', async (req, res) => {
  try {
    // This should be protected by API key in production
    const newBudgets = await Budget.createRecurringBudgets();
    res.json({ 
      message: `Created ${newBudgets.length} recurring budgets`,
      budgets: newBudgets 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;