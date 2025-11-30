# Quick Start Guide - Testing from VM

## Step 1: Start the Honeypot Server

```bash
npm start
```

The server will display your local IP address. Example:
```
🚨 HONEYPOT SERVER RUNNING 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Local:    http://localhost:3000
Network:  http://192.168.1.100:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 2: Access from Your VM

1. **Find the Network IP** from the server output (e.g., `192.168.1.100`)
2. **From your VM**, open a browser and go to: `http://192.168.1.100:3000`
3. **Or use curl** from VM terminal:
   ```bash
   curl http://192.168.1.100:3000
   ```

## Step 3: Test Attacks

### From Browser (VM):
- Navigate to login page
- Try SQL injection: `admin' OR '1'='1` as username
- Try XSS in contact form: `<script>alert('XSS')</script>`
- Try accessing admin page directly
- All attempts will be logged!

### From Terminal (VM):
```bash
# Run the test script
./test-attacks.sh http://192.168.1.100:3000

# Or manually test:
# SQL Injection
curl -X POST http://192.168.1.100:3000/api/login \
  -d "username=admin' OR '1'='1&password=test"

# XSS Test
curl -X POST http://192.168.1.100:3000/api/contact \
  -d "name=<script>alert('XSS')</script>&message=test"
```

## Step 4: View Logs

### Real-time Monitoring:
```bash
# On the honeypot server
sqlite3 private/honeypot.db "SELECT * FROM requests ORDER BY timestamp DESC LIMIT 10;"
```

### Web Interface:
- Navigate to: `http://192.168.1.100:3000/monitor.html`
- View all logged requests in real-time

### API:
```bash
# View all logs
curl http://192.168.1.100:3000/api/logs

# View stats
curl http://192.168.1.100:3000/api/stats
```

## Common Issues

### Can't access from VM:
1. **Check firewall** - Allow port 3000
   ```bash
   # macOS
   System Preferences > Security & Privacy > Firewall > Firewall Options
   
   # Linux
   sudo ufw allow 3000/tcp
   ```

2. **Verify network** - Make sure VM and host are on same network
   ```bash
   # From VM, ping the host
   ping 192.168.1.100
   ```

3. **Check server is running** - Server should show "Network: http://..."

### Forms not logging:
- Check browser console for errors
- Verify the form action points to `/api/login` or `/api/contact`
- Check server terminal for errors

## Example Attack Scenarios

### Scenario 1: SQL Injection Attempt
1. From VM, go to login page
2. Enter: `admin' OR '1'='1` as username
3. Enter any password
4. Submit form
5. Check logs - you'll see the SQL injection attempt logged!

### Scenario 2: Path Traversal
1. From VM browser, try: `http://192.168.1.100:3000/../../etc/passwd`
2. Should get 403 Forbidden
3. Check logs - path traversal attempt is logged

### Scenario 3: XSS Attack
1. From VM, go to contact page
2. Enter: `<script>alert('XSS')</script>` in name field
3. Submit form
4. Check logs - XSS attempt is logged with full payload

## Tips

- **Use a separate VM** for the honeypot (don't run on your main machine)
- **Isolate the network** - Use a separate VLAN if possible
- **Monitor regularly** - Check logs frequently
- **Backup database** - Copy `private/honeypot.db` regularly
- **Test different attacks** - Try various SQL injection, XSS, path traversal patterns

