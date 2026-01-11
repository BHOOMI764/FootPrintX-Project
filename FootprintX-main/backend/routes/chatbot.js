const express = require('express');
const router = express.Router();
const { processMessage, getUserContext } = require('../controllers/chatbotController');
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/authMiddleware');

// @route   POST api/chatbot/process
// @desc    Process user message and return bot response
// @access  Private
router.post('/process', auth, processMessage);

// @route   GET api/chatbot/context
// @desc    Get user context for chatbot
// @access  Private
router.get('/context', auth, getUserContext);

// @route   GET api/chatbot/history
// @desc    Get user chat history
// @access  Private
router.get('/history', auth, chatbotController.getHistory);

module.exports = router;
