const geoip = require('geoip-lite');
const { logRequest } = require('./database');

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
}

/**
 * Get GeoIP information for an IP address
 */
function getGeoIP(ip) {
  try {
    // Skip local/private IPs
    if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || 
        ip.startsWith('10.') || ip.startsWith('172.') || ip === '::1') {
      return null;
    }
    
    const geo = geoip.lookup(ip);
    if (!geo) return null;
    
    return {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone,
      ll: geo.ll // latitude/longitude
    };
  } catch (error) {
    return null;
  }
}

/**
 * Sanitize and format request parameters
 */
function formatParams(req) {
  const params = {};
  
  // Query parameters
  if (Object.keys(req.query).length > 0) {
    params.query = req.query;
  }
  
  // Body parameters (if available)
  if (req.body && Object.keys(req.body).length > 0) {
    params.body = req.body;
  }
  
  // URL parameters (if using route params)
  if (req.params && Object.keys(req.params).length > 0) {
    params.route = req.params;
  }
  
  // Return null if no params, otherwise JSON string
  return Object.keys(params).length > 0 ? JSON.stringify(params) : null;
}

/**
 * Request logging middleware
 * Captures all request details and stores them in the database
 */
function requestLogger(req, res, next) {
  // Capture start time
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end to capture response status
  res.end = function(chunk, encoding) {
    // Restore original end
    res.end = originalEnd;
    
    // Call original end
    res.end(chunk, encoding);
    
    // Log request after response is sent
    const ip = getClientIP(req);
    const geoipData = getGeoIP(ip);
    const params = formatParams(req);
    
    const requestData = {
      timestamp: new Date().toISOString(),
      ip: ip,
      method: req.method,
      path: req.path || req.url,
      status: res.statusCode,
      userAgent: req.headers['user-agent'] || null,
      params: params,
      referrer: req.headers['referer'] || req.headers['referrer'] || null,
      geoip: geoipData ? JSON.stringify(geoipData) : null,
      notes: null // Can be used for additional notes/flags
    };
    
    // Add notes for suspicious activity
    const notes = [];
    
    // Check for common attack patterns
    if (req.path.includes('admin') || req.path.includes('login')) {
      notes.push('Admin/Login access attempt');
    }
    
    if (req.path.includes('..') || req.path.includes('//')) {
      notes.push('Path traversal attempt');
    }
    
    if (req.query && Object.keys(req.query).some(key => 
      key.toLowerCase().includes('sql') || 
      key.toLowerCase().includes('script') ||
      key.toLowerCase().includes('union')
    )) {
      notes.push('Potential injection attempt');
    }
    
    if (req.headers['user-agent'] && (
      req.headers['user-agent'].toLowerCase().includes('sqlmap') ||
      req.headers['user-agent'].toLowerCase().includes('nikto') ||
      req.headers['user-agent'].toLowerCase().includes('nmap')
    )) {
      notes.push('Security scanner detected');
    }
    
    if (notes.length > 0) {
      requestData.notes = notes.join('; ');
    }
    
    // Log to database (async, non-blocking)
    setImmediate(() => {
      logRequest(requestData);
    });
  };
  
  // Continue to next middleware
  next();
}

module.exports = {
  requestLogger,
  getClientIP,
  getGeoIP
};

