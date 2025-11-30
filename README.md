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

- **AI-Powered Threat Analysis**: LLM integration for intelligent threat detection and analysis
  - Identifies attack types (SQL injection, path traversal, etc.)
  - Geographic origin analysis
  - Security recommendations

- **API Endpoints**: 
  - `/api/logs` - View all logged requests
  - `/api/stats` - Get statistics about requests
  - `/api/threat-analysis` - Get AI-powered threat analysis

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

2. The server will run on `http://localhost:3000` by default

3. Access the website:
   - Home: `http://localhost:3000/`
   - Login: `http://localhost:3000/login.html`
   - Admin: `http://localhost:3000/admin.html`
   - Monitor: `http://localhost:3000/monitor.html` (with threat analysis)

4. View logs:
   - All logs: `http://localhost:3000/api/logs`
   - By IP: `http://localhost:3000/api/logs?ip=1.2.3.4`
   - Statistics: `http://localhost:3000/api/stats`
   - Threat Analysis: `http://localhost:3000/api/threat-analysis`

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

## LLM Threat Analysis

The monitor page includes AI-powered threat analysis using online LLM services. Multiple providers are supported:

### Supported LLM Providers:

1. **Groq** (Recommended - Fast & Free Tier) ⭐
2. **OpenAI** (GPT-3.5/GPT-4)
3. **Anthropic** (Claude)
4. **Ollama** (Local - for offline use)

### Quick Setup (Groq - Recommended):

1. **Get a free Groq API key**:
   - Visit https://console.groq.com/keys
   - Sign up and create an API key (free tier available)

2. **Configure in `.env` file**:
   ```bash
   LLM_PROVIDER=groq
   GROQ_API_KEY=your_groq_api_key_here
   LLM_MODEL=llama-3.1-8b-instant
   ```

3. **Restart your server** and visit `/monitor.html`

### Alternative Providers:

**OpenAI:**
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
LLM_MODEL=gpt-3.5-turbo
```

**Anthropic (Claude):**
```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_key
LLM_MODEL=claude-3-haiku-20240307
```

**Local Ollama (for offline use):**
```bash
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
LLM_MODEL=llama2
# Then run: ollama serve (in one terminal)
# And: ollama pull llama2 (in another terminal)
```

### What the LLM Analyzes:

- Types of threats detected (SQL injection, path traversal, etc.)
- Geographic origins of attacks
- Threat descriptions and severity
- Security recommendations

**Default:** The system uses Groq by default (fast, free tier available). Change `LLM_PROVIDER` in `.env` to switch providers.

## Security Notes

- This is a honeypot designed to attract and log unauthorized access attempts
- All data is sanitized before storage to prevent injection attacks
- The database file (`honeypot.db`) is created automatically
- Consider running this in a controlled environment
- Keep your OpenAI API key secure and never commit it to version control

## Querying the Database

You can query the SQLite database directly:

```bash
sqlite3 honeypot.db "SELECT * FROM requests ORDER BY timestamp DESC LIMIT 10;"
```

Or use a SQLite browser tool to view the data.

