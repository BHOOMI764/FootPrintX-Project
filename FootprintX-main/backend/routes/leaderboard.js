// Leaderboard API removed. Respond with 410 Gone for any calls.
const express = require('express');
const router = express.Router();

router.use((req, res) => {
	res.status(410).json({ message: 'Leaderboard endpoint has been removed' });
});

module.exports = router;