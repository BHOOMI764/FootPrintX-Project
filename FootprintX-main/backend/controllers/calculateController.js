const Calculation = require('../models/Calculation');

exports.saveCalculation = async (req, res) => {
    const { inputData, result, score } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }

    try {
        const newCalculation = await Calculation.create({
            userId: req.user.id,
            inputData,
            result,
            score,
        });

        res.json(newCalculation);
    } catch (err) {
        console.error('Save Calculation Error:', err.message);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message })) });
        }
        res.status(500).send('Server Error during calculation saving');
    }
};

// @route   GET api/calculate/history
// @desc    Get recent calculations for the authenticated user
// @access  Private (requires auth middleware)
exports.getUserHistory = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }

    const limit = parseInt(req.query.limit, 10) || 20;

    try {
        const calculations = await Calculation.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit,
        });

        const totalScore = calculations.reduce((sum, c) => sum + (c.score || 0), 0);
        const summary = {
            count: calculations.length,
            totalScore,
            averageScore: calculations.length ? Math.round(totalScore / calculations.length) : 0,
            lastUpdated: calculations[0]?.createdAt || null,
        };

        res.json({ calculations, summary });
    } catch (err) {
        console.error('Fetch History Error:', err.message);
        res.status(500).send('Server Error fetching calculation history');
    }
};
