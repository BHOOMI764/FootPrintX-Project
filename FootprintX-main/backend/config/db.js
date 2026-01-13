const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support DATABASE_URL for Postgres (production) and fallback to SQLite for local/dev
const databaseUrl = process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: console.log,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: process.env.SQLITE_PATH || './database.sqlite',
      logging: console.log,
    });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
