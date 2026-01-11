const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User'); // Import User model for association

const Calculation = sequelize.define('Calculation', {
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
  inputData: {
    type: DataTypes.JSON, // Store complex input as JSON
    allowNull: false,
  },
  result: {
    type: DataTypes.FLOAT, // Use FLOAT for potentially non-integer results
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'calculations',
  timestamps: true,
});

// Define the association
User.hasMany(Calculation, { foreignKey: 'userId' });
Calculation.belongsTo(User, { foreignKey: 'userId' });

module.exports = Calculation;
