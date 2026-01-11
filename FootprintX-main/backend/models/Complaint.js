const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User'); // Import User model for association

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT, // Use TEXT for potentially longer messages
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Submitted', 'Processing', 'Resolved', 'Rejected'),
    allowNull: false,
    defaultValue: 'Submitted',
  },
}, {
  tableName: 'complaints',
  timestamps: true,
});

// Define the association
User.hasMany(Complaint, { foreignKey: 'userId' });
Complaint.belongsTo(User, { foreignKey: 'userId' });

module.exports = Complaint;
