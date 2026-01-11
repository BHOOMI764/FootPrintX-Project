const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        let existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user using Sequelize
        const newUser = await User.create({
            email,
            password: hashedPassword,
        });

        // Return jsonwebtoken
        const payload = {
            user: {
                id: newUser.id, // Use the id from the created user
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }, // Use env var for expiration
            (err, token) => {
                if (err) {
                    console.error('JWT Signing Error during registration:', err);
                    // Don't throw, send an error response
                    return res.status(500).json({ msg: 'Error generating token' });
                }
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Register Error:', err.message);
        // Check for Sequelize validation errors
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message })) });
        }
        res.status(500).send('Server error during registration');
    }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    try {
        // See if user exists using Sequelize
        let user = await User.findOne({ where: { email: email } });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found');
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');

        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        // Update login count and last login time using Sequelize instance methods
        user.loginCount = (user.loginCount || 0) + 1;
        user.lastLogin = new Date();
        await user.save(); // Persist changes to the database
        console.log('Login successful, updating user stats');

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' },
            (err, token) => {
                if (err) {
                    console.error('JWT signing error:', err);
                    // Don't throw, send an error response
                    return res.status(500).json({ msg: 'Error generating token' });
                }
                console.log('Token generated successfully');
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error during login');
    }
};

// @route   GET api/auth/me
// @desc    Get current authenticated user
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // User is already attached to req by authMiddleware
        const user = req.user;
        
        // Return user data without password
        const userData = {
            id: user.id,
            email: user.email,
            loginCount: user.loginCount,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.json(userData);
    } catch (err) {
        console.error('Get Me Error:', err.message);
        res.status(500).send('Server error fetching user data');
    }
};
