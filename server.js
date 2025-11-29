const express = require('express');
const path = require('path');
const { requestLogger } = require('./logger');
const { getAllRequests, getRequestsByIP, getStats } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply request logging middleware to all routes
app.use(requestLogger);

// Serve static files (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname)));

// API endpoint to view logs (optional, for monitoring)
app.get('/api/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const ip = req.query.ip;
    
    let logs;
    if (ip) {
      logs = await getRequestsByIP(ip, limit);
    } else {
      logs = await getAllRequests(limit);
    }
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs'
    });
  }
});

// API endpoint for statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Honeypot server running on http://localhost:${PORT}`);
  console.log(`View logs at http://localhost:${PORT}/api/logs`);
  console.log(`View stats at http://localhost:${PORT}/api/stats`);
});

