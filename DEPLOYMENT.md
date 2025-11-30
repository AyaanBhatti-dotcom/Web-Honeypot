# Honeypot Deployment Guide

This guide explains how to deploy your honeypot so you can test it from VMs and capture real attack data.

## Deployment Options

### Option 1: Local Network Deployment (Recommended for Testing)

Deploy on your local network so VMs can access it.

#### Steps:

1. **Find your local IP address:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. **Update server.js to listen on all interfaces:**
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
     // This allows connections from other machines
   });
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access from VM:**
   - From your VM, navigate to: `http://YOUR_LOCAL_IP:3000`
   - Example: `http://192.168.1.100:3000`

5. **Firewall Configuration:**
   ```bash
   # macOS - Allow incoming connections on port 3000
   sudo pfctl -f /etc/pf.conf
   
   # Linux - Allow port 3000
   sudo ufw allow 3000/tcp
   ```

### Option 2: Remote Server Deployment

Deploy to a remote server for testing from different networks.

#### Steps:

1. **Set up a remote server** (your own server or dedicated machine)
2. **Install Node.js** on the server
3. **Transfer files** to the server
4. **Start the server** and access from your VM

### Option 3: Docker Deployment

Create a Docker container for easy deployment.

## Testing from a VM

### 1. Basic Access Test
```bash
# From your VM
curl http://YOUR_SERVER_IP:3000
```

### 2. SQL Injection Test
```bash
# Test SQL injection in login form
curl -X POST http://YOUR_SERVER_IP:3000/api/login \
  -d "username=admin' OR '1'='1&password=test"
```

### 3. Path Traversal Test
```bash
# Try accessing private folder
curl http://YOUR_SERVER_IP:3000/private/honeypot.db
# Should return 403 Forbidden

# Try path traversal
curl http://YOUR_SERVER_IP:3000/../../etc/passwd
```

### 4. XSS Test
```bash
# Test XSS in contact form
curl -X POST http://YOUR_SERVER_IP:3000/api/contact \
  -d "name=<script>alert('XSS')</script>&message=test"
```

### 5. Using Browser from VM
- Open browser in VM
- Navigate to your honeypot URL
- Try various attacks through the web interface
- All attempts will be logged

## Viewing Logs

### Real-time Monitoring:
```bash
# Watch the database
sqlite3 private/honeypot.db "SELECT * FROM requests ORDER BY timestamp DESC LIMIT 10;"

# Or use the monitor page
# Navigate to: http://YOUR_SERVER_IP:3000/monitor.html
```

### API Endpoints:
```bash
# View all logs
curl http://YOUR_SERVER_IP:3000/api/logs

# View stats
curl http://YOUR_SERVER_IP:3000/api/stats

# View logs by IP
curl http://YOUR_SERVER_IP:3000/api/logs?ip=192.168.1.50
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **This is a honeypot** - It's designed to attract attacks
2. **Don't use real credentials** - All forms are fake
3. **Isolate the network** - Consider using a separate network/VLAN
4. **Monitor closely** - Watch for actual malicious activity
5. **Use a VM for the honeypot** - Don't run on your main machine
6. **Backup logs** - Regularly backup the database

## Deployment Checklist

- [ ] Change default port (if needed)
- [ ] Set up reverse proxy (nginx/Apache) for port 80/443
- [ ] Configure SSL/TLS certificate
- [ ] Set up automated backups
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerts
- [ ] Use environment variables for sensitive config
- [ ] Set up log rotation

## Troubleshooting

### Can't access from VM:
- Check firewall settings
- Verify server is listening on 0.0.0.0, not just 127.0.0.1
- Check network connectivity (ping test)
- Verify port is open

### Forms not logging:
- Check browser console for errors
- Verify server is running
- Check database permissions
- Review server logs

### Database errors:
- Ensure private folder exists and is writable
- Check file permissions: `chmod 755 private`
- Verify SQLite is installed

