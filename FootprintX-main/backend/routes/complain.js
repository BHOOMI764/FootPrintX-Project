const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const complainController = require('../controllers/complainController');

// @route   POST api/complain
// @desc    Submit a new complaint
// @access  Private
router.post('/', authMiddleware, complainController.submitComplaint);

// Add other routes here if needed (e.g., GET / for user's complaints)

module.exports = router;
