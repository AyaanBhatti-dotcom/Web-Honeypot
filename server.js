require('dotenv').config();
const express = require('express');
const path = require('path');
const { requestLogger } = require('./logger');
const { getAllRequests, getRequestsByIP, getStats } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - important for accurate IP detection
// This allows Express to trust X-Forwarded-* headers
app.set('trust proxy', true);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply request logging middleware to all routes
app.use(requestLogger);

// Block access to private folder
app.use('/private', (req, res) => {
  res.status(403).send('Access Forbidden');
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

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

// Form handling endpoints (these will be logged by the middleware)
app.post('/api/login', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';
  
  // Detect SQL injection patterns
  const sqlInjectionPatterns = [
    /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(\%27)|(\%22)|(\%3B)|(\%2D)|(\%2D)|(\%2F)|(\%2A))/i,
    /(OR|AND)\s+\d+\s*=\s*\d+/i,
    /(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"]/i,
    /UNION\s+SELECT/i,
    /SELECT\s+.*\s+FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+.*\s+SET/i,
    /DELETE\s+FROM/i,
    /DROP\s+TABLE/i,
    /EXEC(\s|\()/i,
    /EXECUTE(\s|\()/i,
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i
  ];
  
  const isSQLInjection = sqlInjectionPatterns.some(pattern => 
    pattern.test(username) || pattern.test(password)
  );
  
  if (isSQLInjection) {
    // SQL injection detected - redirect to admin (honeypot behavior)
    // The request has already been logged by the middleware with notes
    res.redirect('/admin.html');
  } else {
    // Normal login attempt - show error message
    res.status(401).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Access Denied</title>
        <meta http-equiv="refresh" content="3;url=/login.html">
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; color: #00ff00; font-family: 'Share Tech Mono', monospace;">
        <div style="text-align: center; border: 1px solid #00ff00; padding: 2rem;">
          <h2 style="color: #ff5252;">ACCESS DENIED</h2>
          <p>Invalid credentials. Redirecting to login...</p>
        </div>
      </body>
      </html>
    `);
  }
});

app.post('/api/contact', (req, res) => {
  // Honeypot - acknowledge the message
  // The request has already been logged by the middleware
  res.json({
    success: true,
    message: 'Message received. All communications are logged for security purposes.'
  });
});

// Start server - listen on all interfaces for network access
app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find local IP address
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const addr of addresses) {
      if (addr.family === 'IPv4' && !addr.internal) {
        localIP = addr.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`\n🚨 HONEYPOT SERVER RUNNING 🚨`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Local:    http://localhost:${PORT}`);
  console.log(`Network:  http://${localIP}:${PORT}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Monitor:  http://${localIP}:${PORT}/monitor.html`);
  console.log(`API Logs: http://${localIP}:${PORT}/api/logs`);
  console.log(`API Stats: http://${localIP}:${PORT}/api/stats`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

