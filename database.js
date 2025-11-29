// database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize database
const dbPath = path.join(__dirname, "honeypot.db");
const db = new sqlite3.Database(dbPath);

// Create table + indexes
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS requests (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "timestamp TEXT NOT NULL," +
    "ip TEXT NOT NULL," +
    "method TEXT NOT NULL," +
    "path TEXT NOT NULL," +
    "status INTEGER NOT NULL," +
    "user_agent TEXT," +
    "params TEXT," +
    "referrer TEXT," +
    "geoip TEXT," +
    "notes TEXT" +
    ")"
  );

  db.run("CREATE INDEX IF NOT EXISTS idx_timestamp ON requests(timestamp)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ip ON requests(ip)");
  db.run("CREATE INDEX IF NOT EXISTS idx_path ON requests(path)");
});

// ---- Helpers ----
function sanitizeData(data) {
  if (!data) return null;
  let sanitized = String(data);

  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000) + "... [truncated]";
  }

  sanitized = sanitized.replace(/\0/g, "");
  return sanitized;
}

// Store request log
function logRequest(requestData) {
  const stmt =
    "INSERT INTO requests (timestamp, ip, method, path, status, user_agent, params, referrer, geoip, notes)" +
    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.run(
    stmt,
    [
      requestData.timestamp,
      sanitizeData(requestData.ip),
      sanitizeData(requestData.method),
      sanitizeData(requestData.path),
      requestData.status,
      sanitizeData(requestData.userAgent),
      sanitizeData(requestData.params),
      sanitizeData(requestData.referrer),
      sanitizeData(requestData.geoip),
      sanitizeData(requestData.notes),
    ],
    (err) => {
      if (err) console.error("DB insert error:", err);
    }
  );
}

function getAllRequests(limit = 100) {
  return new Promise((resolve) => {
    db.all(
      "SELECT * FROM requests ORDER BY timestamp DESC LIMIT ?",
      [limit],
      (err, rows) => {
        if (err) {
          console.error("getAllRequests error:", err);
          return resolve([]);
        }
        resolve(rows);
      }
    );
  });
}

function getRequestsByIP(ip, limit = 100) {
  return new Promise((resolve) => {
    db.all(
      "SELECT * FROM requests WHERE ip = ? ORDER BY timestamp DESC LIMIT ?",
      [ip, limit],
      (err, rows) => {
        if (err) {
          console.error("getRequestsByIP error:", err);
          return resolve([]);
        }
        resolve(rows);
      }
    );
  });
}

function getStats() {
  return new Promise((resolve) => {
    const stats = {
      total: 0,
      uniqueIPs: 0,
      last24Hours: 0,
    };

    db.get("SELECT COUNT(*) AS count FROM requests", (err, row) => {
      if (!err && row) stats.total = row.count;

      db.get(
        "SELECT COUNT(DISTINCT ip) AS count FROM requests",
        (err2, row2) => {
          if (!err2 && row2) stats.uniqueIPs = row2.count;

          db.get(
            "SELECT COUNT(*) AS count FROM requests WHERE timestamp > datetime('now', '-24 hours')",
            (err3, row3) => {
              if (!err3 && row3) stats.last24Hours = row3.count;
              resolve(stats);
            }
          );
        }
      );
    });
  });
}

module.exports = {
  db,
  logRequest,
  getAllRequests,
  getRequestsByIP,
  getStats,
};