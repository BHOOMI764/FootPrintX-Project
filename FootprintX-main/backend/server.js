const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/db');
require('dotenv').config();

require('./models/User');
require('./models/Calculation');
require('./models/Complaint');
require('./models/ChatMessage');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ extended: false }));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle real-time calculation updates
  socket.on('calculation-saved', (data) => {
    // Broadcast to all users for leaderboard updates
    io.emit('leaderboard-update', data);
    
    // Send personal update to the user
    socket.to(`user-${data.userId}`).emit('personal-update', data);
  });

  // Handle real-time carbon price updates
  socket.on('subscribe-carbon-prices', () => {
    socket.join('carbon-prices');
  });

  // Handle real-time weather updates
  socket.on('subscribe-weather', (location) => {
    socket.join(`weather-${location}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Store io instance for use in other modules
app.set('io', io);

app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/calculate', require('./routes/calculate'));
app.use('/api/complain', require('./routes/complain'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/realtime', require('./routes/realtime'));
app.use('/api/twitter', require('./routes/twitter'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected');

    await sequelize.sync({ force: false });
    console.log('Database synchronized');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server ready for real-time connections`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();