const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, // Ensure it's a valid email format
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    loginCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // You can add other fields like name if needed
    // name: {
    //    type: String,
    //    required: true
    // },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    // Other model options go here
    tableName: 'users', // Explicitly define table name
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = User;
