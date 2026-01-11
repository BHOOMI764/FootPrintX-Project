const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/authMiddleware');

// Real-time carbon price data
let carbonPriceData = {
  price: 0,
  trend: 'stable',
  lastUpdated: new Date(),
  source: 'Carbon Pricing API'
};

// Real-time weather data cache
const weatherCache = new Map();

// @route   GET api/realtime/carbon-price
// @desc    Get real-time carbon price data
// @access  Public
router.get('/carbon-price', async (req, res) => {
  try {
    // Simulate real-time carbon price updates
    const basePrice = 50; // Base price per ton CO2
    const variation = (Math.random() - 0.5) * 10; // ±5 variation
    const newPrice = Math.max(0, basePrice + variation);
    
    // Determine trend
    let trend = 'stable';
    if (newPrice > carbonPriceData.price + 1) trend = 'up';
    else if (newPrice < carbonPriceData.price - 1) trend = 'down';
    
    carbonPriceData = {
      price: Math.round(newPrice * 100) / 100,
      trend,
      lastUpdated: new Date(),
      source: 'Real-time Carbon Market Data'
    };

    // Broadcast to subscribed clients
    const io = req.app.get('io');
    io.to('carbon-prices').emit('carbon-price-update', carbonPriceData);

    res.json(carbonPriceData);
  } catch (error) {
    console.error('Carbon price error:', error);
    res.status(500).json({ msg: 'Error fetching carbon price data' });
  }
});

// @route   GET api/realtime/weather/:location
// @desc    Get real-time weather data for carbon intensity
// @access  Public
router.get('/weather/:location', async (req, res) => {
  const { location } = req.params;
  
  try {
    // Check cache first
    const cached = weatherCache.get(location);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return res.json(cached.data);
    }

    // Simulate weather API call (replace with real API)
    const weatherData = {
      location,
      temperature: Math.round((Math.random() * 30 + 10) * 10) / 10, // 10-40°C
      humidity: Math.round(Math.random() * 100),
      windSpeed: Math.round(Math.random() * 20 * 10) / 10, // 0-20 m/s
      solarIrradiance: Math.round(Math.random() * 1000), // 0-1000 W/m²
      carbonIntensity: Math.round(Math.random() * 500 + 200), // 200-700 gCO2/kWh
      lastUpdated: new Date(),
      source: 'Weather API'
    };

    // Cache the data
    weatherCache.set(location, {
      data: weatherData,
      timestamp: Date.now()
    });

    // Broadcast to subscribed clients
    const io = req.app.get('io');
    io.to(`weather-${location}`).emit('weather-update', weatherData);

    res.json(weatherData);
  } catch (error) {
    console.error('Weather data error:', error);
    res.status(500).json({ msg: 'Error fetching weather data' });
  }
});

// @route   GET api/realtime/electricity-intensity
// @desc    Get real-time electricity carbon intensity
// @access  Public
router.get('/electricity-intensity', async (req, res) => {
  try {
    // Simulate real-time electricity carbon intensity
    const intensityData = {
      region: 'Global Average',
      carbonIntensity: Math.round(Math.random() * 200 + 300), // 300-500 gCO2/kWh
      renewablePercentage: Math.round(Math.random() * 40 + 30), // 30-70%
      coalPercentage: Math.round(Math.random() * 30 + 10), // 10-40%
      gasPercentage: Math.round(Math.random() * 20 + 10), // 10-30%
      nuclearPercentage: Math.round(Math.random() * 15 + 5), // 5-20%
      lastUpdated: new Date(),
      source: 'Electricity Grid API'
    };

    res.json(intensityData);
  } catch (error) {
    console.error('Electricity intensity error:', error);
    res.status(500).json({ msg: 'Error fetching electricity intensity' });
  }
});

// @route   GET api/realtime/transport-emissions
// @desc    Get real-time transport emission factors
// @access  Public
router.get('/transport-emissions', async (req, res) => {
  try {
    const transportData = {
      car: {
        averageEmissions: 120, // gCO2/km
        electricEmissions: 50, // gCO2/km (including grid)
        hybridEmissions: 80, // gCO2/km
        trend: 'decreasing'
      },
      bus: {
        averageEmissions: 89, // gCO2/km per passenger
        trend: 'stable'
      },
      train: {
        averageEmissions: 14, // gCO2/km per passenger
        electricEmissions: 6, // gCO2/km per passenger
        trend: 'decreasing'
      },
      plane: {
        averageEmissions: 285, // gCO2/km per passenger
        shortHaulEmissions: 255, // gCO2/km per passenger
        longHaulEmissions: 295, // gCO2/km per passenger
        trend: 'stable'
      },
      lastUpdated: new Date(),
      source: 'Transport Emission Database'
    };

    res.json(transportData);
  } catch (error) {
    console.error('Transport emissions error:', error);
    res.status(500).json({ msg: 'Error fetching transport emissions' });
  }
});

// @route   POST api/realtime/subscribe
// @desc    Subscribe to real-time updates
// @access  Private
router.post('/subscribe', auth, (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ msg: 'User not authenticated' });
  }
  
  const userId = req.user.id;
  const { subscriptions } = req.body; // ['carbon-prices', 'weather', 'leaderboard']
  
  try {
    const io = req.app.get('io');
    
    // Join user to subscribed channels
    if (subscriptions && Array.isArray(subscriptions)) {
      subscriptions.forEach(subscription => {
        io.to(`user-${userId}`).emit('subscription-confirmed', {
          subscription,
          status: 'active',
          timestamp: new Date()
        });
      });
    }

    res.json({ 
      msg: 'Subscriptions activated',
      subscriptions: subscriptions || [],
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ msg: 'Error setting up subscriptions' });
  }
});

// @route   GET api/realtime/notifications/:userId
// @desc    Get real-time notifications for user
// @access  Private
router.get('/notifications/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Simulate real-time notifications
    const notifications = [
      {
        id: 1,
        type: 'achievement',
        title: 'Carbon Footprint Reduced!',
        message: 'Your weekly average decreased by 15%',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: false
      },
      {
        id: 2,
        type: 'tip',
        title: 'Energy Saving Tip',
        message: 'Consider switching to LED bulbs to reduce energy consumption',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: false
      },
      {
        id: 3,
        type: 'leaderboard',
        title: 'Leaderboard Update',
        message: 'You moved up 3 positions in the leaderboard!',
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        read: true
      }
    ];

    res.json(notifications);
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ msg: 'Error fetching notifications' });
  }
});

module.exports = router;
