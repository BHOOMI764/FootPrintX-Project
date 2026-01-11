const Complaint = require('../models/Complaint');

// @route   POST api/complain
// @desc    Submit a new complaint
// @access  Private (requires auth middleware)
exports.submitComplaint = async (req, res) => {
    const { subject, message } = req.body;

    // req.user is attached by the auth middleware
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }

    try {
        // Create a new complaint record using Sequelize
        const newComplaint = await Complaint.create({
            userId: req.user.id, // User submitting the complaint
            subject,
            message,
            // status defaults to 'Submitted' based on the model definition
        });

        // Optional: Add logic here to notify admins or relevant parties

        res.json(newComplaint); // Return the newly created complaint record
    } catch (err) {
        console.error('Submit Complaint Error:', err.message);
        // Check for Sequelize validation errors
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message })) });
        }
        res.status(500).send('Server Error during complaint submission');
    }
};

// You might add other controller functions here later, e.g.,
// - Get all complaints (for admin)
// - Get complaints by user
// - Update complaint status (for admin)
