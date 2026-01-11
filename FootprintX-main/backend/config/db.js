const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_PATH || './database.sqlite', 
  logging: console.log, 
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the SQLite database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
