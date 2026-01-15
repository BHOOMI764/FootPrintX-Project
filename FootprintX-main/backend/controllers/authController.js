const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.register = async (req, res) => {
    const { email, password } = req.body;
    console.log('Register attempt for email:', email);

    try {
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ errors: [{ msg: 'Email and password are required' }] });
        }

        let existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            console.log('User already exists');
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

        console.log('User created successfully:', newUser.id);

        // Return jsonwebtoken
        const payload = {
            user: {
                id: newUser.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '7d' },
            (err, token) => {
                if (err) {
                    console.error('JWT Signing Error during registration:', err);
                    return res.status(500).json({ msg: 'Error generating token' });
                }
                console.log('Token generated successfully');
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Register Error:', err.message, err);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message })) });
        }
        res.status(500).json({ msg: 'Server error during registration' });
    }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    try {
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ errors: [{ msg: 'Email and password are required' }] });
        }

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
            { expiresIn: process.env.JWT_EXPIRATION || '7d' },
            (err, token) => {
                if (err) {
                    console.error('JWT signing error:', err);
                    return res.status(500).json({ msg: 'Error generating token' });
                }
                console.log('Token generated successfully');
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Login error:', err.message, err);
        res.status(500).json({ msg: 'Server error during login' });
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

// @route   POST api/auth/demo
// @desc    Get demo/guest token without registration
// @access  Public
exports.demoLogin = async (req, res) => {
    try {
        console.log('Demo login attempt');
        
        // Create a demo user or use existing one
        let demoUser = await User.findOne({ where: { email: 'demo@footprintx.com' } });
        
        if (!demoUser) {
            console.log('Creating demo user');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('demo123', salt);
            demoUser = await User.create({
                email: 'demo@footprintx.com',
                password: hashedPassword,
            });
            console.log('Demo user created:', demoUser.id);
        } else {
            console.log('Demo user already exists:', demoUser.id);
        }

        const payload = {
            user: {
                id: demoUser.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '7d' },
            (err, token) => {
                if (err) {
                    console.error('JWT Signing Error:', err);
                    return res.status(500).json({ msg: 'Error generating token' });
                }
                console.log('Demo token generated successfully');
                res.json({ token, isDemo: true });
            }
        );
    } catch (err) {
        console.error('Demo Login Error:', err.message, err);
        res.status(500).json({ msg: 'Server error during demo login' });
    }
};
