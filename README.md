# Web Honeypot

A simple web honeypot that logs all incoming requests to a SQLite database for security monitoring and analysis.

## Features

- **Request Logging**: Captures detailed information about every request
  - IP address
  - Timestamp
  - HTTP method and path
  - User-Agent
  - Query parameters and body (sanitized)
  - Referrer
  - Status code
  - GeoIP information (country, region, city)
  - Automatic detection of suspicious activity

- **Database Storage**: SQLite database with indexed fields for fast queries

- **Threat Detection**: Automatic detection of suspicious activity patterns
  - Identifies attack types (SQL injection, path traversal, etc.)
  - Geographic origin analysis
  - Security recommendations

- **API Endpoints**: 
  - `/api/logs` - View all logged requests
  - `/api/stats` - Get statistics about requests

## Installation

1. Install Node.js (v14 or higher)

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. The server will run on `http://localhost:3000` by default and display your local IP address for network access

3. **For VM Testing**: The server listens on all interfaces (0.0.0.0), so you can access it from other machines/VMs on your network using your local IP address

4. **Fake IP Generation (for documentation)**: 
   - Enable random IP generation by setting `USE_FAKE_IPS=true` in your `.env` file
   - Each request will get a random IP address and geolocation
   - Useful for creating realistic-looking documentation and testing
   - Restart server after changing this setting

5. Access the website:
   - Home: `http://localhost:3000/`
   - Login: `http://localhost:3000/login.html`
   - Admin: `http://localhost:3000/admin.html`
   - Monitor: `http://localhost:3000/monitor.html`

6. View logs:
   - All logs: `http://localhost:3000/api/logs`
   - By IP: `http://localhost:3000/api/logs?ip=1.2.3.4`
   - Statistics: `http://localhost:3000/api/stats`

## Database Schema

The `requests` table stores:
- `id` - Auto-incrementing primary key
- `timestamp` - ISO timestamp of the request
- `ip` - Client IP address
- `method` - HTTP method (GET, POST, etc.)
- `path` - Request path
- `status` - HTTP status code
- `user_agent` - User-Agent header
- `params` - JSON string of query/body parameters
- `referrer` - Referrer header
- `geoip` - JSON string of GeoIP data (country, region, city, coordinates)
- `notes` - Additional notes/flags for suspicious activity

## Threat Analysis

The monitor page displays logged threats and suspicious activity. Manual threat analysis can be implemented in the monitor page.

## Security Notes

- This is a honeypot designed to attract and log unauthorized access attempts
- All data is sanitized before storage to prevent injection attacks
- The database file (`honeypot.db`) is created automatically in the `private/` folder
- Consider running this in a controlled environment
- Keep sensitive configuration secure and never commit it to version control

## Querying the Database

You can query the SQLite database directly:

```bash
sqlite3 private/honeypot.db "SELECT * FROM requests ORDER BY timestamp DESC LIMIT 10;"
```

Or use a SQLite browser tool to view the data.

