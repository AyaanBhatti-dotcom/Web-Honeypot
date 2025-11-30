const geoip = require('geoip-lite');
const { logRequest } = require('./database');

// Enable fake IP generation for documentation (set USE_FAKE_IPS=true in .env)
const USE_FAKE_IPS = process.env.USE_FAKE_IPS === 'true' || process.env.USE_FAKE_IPS === '1';

/**
 * Generate a random fake IP address
 * For documentation purposes
 */
function generateFakeIP() {
  // Generate random public IP ranges (not private IPs)
  const ranges = [
    // Common public IP ranges
    () => `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}`,
    // More realistic distribution
    () => {
      const first = [1, 2, 3, 5, 8, 13, 21, 34, 45, 46, 47, 50, 51, 52, 54, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223];
      const firstOctet = first[Math.floor(Math.random() * first.length)];
      return `${firstOctet}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}`;
    }
  ];
  
  const generator = ranges[Math.floor(Math.random() * ranges.length)];
  return generator();
}

/**
 * Generate fake geolocation data for a fake IP
 * For documentation purposes
 */
function generateFakeGeoIP() {
  const countries = [
    { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'] },
    { code: 'CN', name: 'China', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an', 'Nanjing', 'Tianjin'] },
    { code: 'RU', name: 'Russia', cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don'] },
    { code: 'DE', name: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'] },
    { code: 'GB', name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Leeds', 'Edinburgh', 'Bristol', 'Cardiff', 'Belfast'] },
    { code: 'FR', name: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'] },
    { code: 'JP', name: 'Japan', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama'] },
    { code: 'BR', name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'] },
    { code: 'IN', name: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'] },
    { code: 'KR', name: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Seongnam', 'Goyang', 'Suwon'] },
    { code: 'NL', name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen'] },
    { code: 'CA', name: 'Canada', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'] },
    { code: 'AU', name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'] },
    { code: 'IT', name: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'] },
    { code: 'ES', name: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'] },
    { code: 'PL', name: 'Poland', cities: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice'] },
    { code: 'TR', name: 'Turkey', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya', 'Kayseri', 'Mersin'] },
    { code: 'MX', name: 'Mexico', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'San Luis Potosí'] },
    { code: 'ID', name: 'Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Palembang', 'Makassar', 'Tangerang', 'Depok', 'South Tangerang'] },
    { code: 'VN', name: 'Vietnam', cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Haiphong', 'Can Tho', 'Bien Hoa', 'Hue', 'Nha Trang', 'Vung Tau', 'Quy Nhon'] }
  ];
  
  const country = countries[Math.floor(Math.random() * countries.length)];
  const city = country.cities[Math.floor(Math.random() * country.cities.length)];
  
  // Generate random coordinates within reasonable ranges
  const lat = (Math.random() * 180) - 90;
  const lon = (Math.random() * 360) - 180;
  
  // Generate timezone based on longitude
  const timezone = `GMT${lon >= 0 ? '+' : ''}${Math.floor(lon / 15)}`;
  
  return {
    country: country.code,
    region: city,
    city: city,
    timezone: timezone,
    ll: [lat, lon]
  };
}

/**
 * Get client IP address from request
 * Handles proxies, load balancers, and IPv6-mapped IPv4 addresses
 */
function getClientIP(req) {
  let ip = null;
  
  // Check proxy headers first (for reverse proxies, load balancers)
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(',')[0].trim();
  } else if (req.headers['x-real-ip']) {
    ip = req.headers['x-real-ip'];
  } else if (req.headers['x-client-ip']) {
    ip = req.headers['x-client-ip'];
  } else {
    // Get from connection
    ip = req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         req.ip ||
         (req.connection?.socket?.remoteAddress);
  }
  
  if (!ip || ip === 'unknown') {
    return 'unknown';
  }
  
  // Handle IPv6-mapped IPv4 addresses (::ffff:127.0.0.1 -> 127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  // Handle IPv6 localhost (::1 -> 127.0.0.1)
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  
  // Remove port if present (some systems include port in remoteAddress)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    // If it's an IPv6 address with port, take the last part
    // If it's IPv4 with port, take the first part
    if (parts.length === 2 && !ip.includes('::')) {
      ip = parts[0]; // IPv4 with port
    } else if (parts.length > 2) {
      // IPv6 address, might have port at the end
      // Check if last part is a number (port)
      const lastPart = parts[parts.length - 1];
      if (/^\d+$/.test(lastPart)) {
        ip = parts.slice(0, -1).join(':');
      }
    }
  }
  
  return ip || 'unknown';
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
    let ip = getClientIP(req);
    let geoipData;
    
    // Use fake IP and geolocation if enabled
    if (USE_FAKE_IPS) {
      ip = generateFakeIP();
      geoipData = generateFakeGeoIP();
    } else {
      geoipData = getGeoIP(ip);
    }
    
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
    
    // Check for SQL injection in request body (for POST requests)
    if (req.method === 'POST' && req.body) {
      const bodyStr = JSON.stringify(req.body).toLowerCase();
      const sqlInjectionPatterns = [
        /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(\%27)|(\%22)|(\%3B)|(\%2D)|(\%2D)|(\%2F)|(\%2A))/i,
        /(OR|AND)\s+\d+\s*=\s*\d+/i,
        /(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"]/i,
        /UNION\s+SELECT/i,
        /SELECT\s+.*\s+FROM/i,
        /INSERT\s+INTO/i,
        /UPDATE\s+.*\s+SET/i,
        /DELETE\s+FROM/i,
        /DROP\s+TABLE/i
      ];
      
      if (sqlInjectionPatterns.some(pattern => pattern.test(bodyStr))) {
        notes.push('⚠️ SQL INJECTION ATTEMPT DETECTED');
      }
    }
    
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

