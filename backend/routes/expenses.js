const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// @route   POST api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  const { amount, description, category, date } = req.body;

  // Simple validation
  if (!amount || !description || !category || !date) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const expenseData = {
      user_id: req.user.id,
      amount,
      description,
      category,
      date
    };

    const expense = await Expense.create(expenseData);
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/expenses
// @desc    Get all expenses for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const expenses = await Expense.findByUserId(req.user.id, limit, offset);
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/expenses/:id
// @desc    Get an expense by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id, req.user.id);
    
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { amount, description, category, date } = req.body;

  // Simple validation
  if (!amount || !description || !category || !date) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check if expense exists and belongs to user
    const existingExpense = await Expense.findById(req.params.id, req.user.id);
    
    if (!existingExpense) {
      return res.status(404).json({ msg: 'Expense not found or not authorized' });
    }
    
    const expenseData = {
      amount,
      description,
      category,
      date
    };
    
    const updatedExpense = await Expense.update(req.params.id, req.user.id, expenseData);
    res.json(updatedExpense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Expense.delete(req.params.id, req.user.id);
    
    if (!result) {
      return res.status(404).json({ msg: 'Expense not found or not authorized' });
    }
    
    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/expenses/summary/monthly
// @desc    Get monthly expense total
// @access  Private
router.get('/summary/monthly', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ msg: 'Please provide year and month' });
    }
    
    const total = await Expense.getMonthlyTotal(req.user.id, year, month);
    res.json({ total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/expenses/summary/category
// @desc    Get expense summary by category
// @access  Private
router.get('/summary/category', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Please provide start and end dates' });
    }
    
    const categorySummary = await Expense.getCategorySummary(req.user.id, startDate, endDate);
    res.json(categorySummary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;