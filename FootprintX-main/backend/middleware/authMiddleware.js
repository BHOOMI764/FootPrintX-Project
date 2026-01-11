const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import Sequelize User model
require('dotenv').config();

module.exports = async function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user in the database based on the decoded ID
        const user = await User.findByPk(decoded.user.id);

        if (!user) {
            return res.status(401).json({ msg: 'User not found, authorization denied' });
        }

        // Attach the actual Sequelize user object to the request
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Token is not valid' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired' });
        } else {
            console.error('Auth middleware error:', err);
            return res.status(500).json({ msg: 'Server error during authentication' });
        }
    }
};
