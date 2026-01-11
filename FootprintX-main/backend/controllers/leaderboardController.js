const Calculation = require('../models/Calculation');
const User = require('../models/User');
const { sequelize } = require('../config/db');

// @route   GET api/leaderboard
// @desc    Get leaderboard data (top users by calculation score)
// @access  Private (requires auth middleware)
exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.findAll({
            attributes: [
                'id',
                'email',
                [sequelize.fn('COUNT', sequelize.col('Calculations.id')), 'calculationCount'],
                [sequelize.fn('SUM', sequelize.col('Calculations.score')), 'totalScore']
            ],
            include: [{
                model: Calculation,
                attributes: [],
                required: true
            }],
            group: ['User.id', 'User.email'],
            order: [[sequelize.literal('totalScore'), 'DESC']],
            limit: 10
        });

        // Format the response
        const leaderboard = topUsers.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            email: user.email,
            calculationCount: parseInt(user.getDataValue('calculationCount')) || 0,
            totalScore: parseInt(user.getDataValue('totalScore')) || 0
        }));

        res.json(leaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
};
