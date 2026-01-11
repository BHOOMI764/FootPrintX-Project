const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const calculateController = require('../controllers/calculateController');

// @route   POST api/calculate
// @desc    Save a calculation result
// @access  Private
router.post('/', authMiddleware, calculateController.saveCalculation);

// @route   GET api/calculate/history
// @desc    Get recent calculations for the authenticated user
// @access  Private
router.get('/history', authMiddleware, calculateController.getUserHistory);

module.exports = router;
