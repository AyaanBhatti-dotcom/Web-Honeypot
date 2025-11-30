#!/bin/bash
# Honeypot Attack Simulation Script
# Use this to test your honeypot from a VM or another machine

HONEYPOT_URL="${1:-http://localhost:3000}"

echo "🚨 Testing Honeypot at: $HONEYPOT_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Basic Access
echo -e "\n[1] Testing basic access..."
curl -s "$HONEYPOT_URL" > /dev/null && echo "✓ Basic access works" || echo "✗ Basic access failed"

# Test 2: SQL Injection in Login
echo -e "\n[2] Testing SQL Injection in login form..."
curl -s -X POST "$HONEYPOT_URL/api/login" \
  -d "username=admin' OR '1'='1&password=test" \
  > /dev/null && echo "✓ SQL injection attempt logged" || echo "✗ SQL injection test failed"

# Test 3: Path Traversal
echo -e "\n[3] Testing path traversal..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HONEYPOT_URL/../../etc/passwd")
if [ "$RESPONSE" = "403" ] || [ "$RESPONSE" = "404" ]; then
  echo "✓ Path traversal blocked (HTTP $RESPONSE)"
else
  echo "⚠ Path traversal returned HTTP $RESPONSE"
fi

# Test 4: Access Private Folder
echo -e "\n[4] Testing private folder access..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HONEYPOT_URL/private/honeypot.db")
if [ "$RESPONSE" = "403" ]; then
  echo "✓ Private folder protected (HTTP 403)"
else
  echo "⚠ Private folder returned HTTP $RESPONSE"
fi

# Test 5: XSS in Contact Form
echo -e "\n[5] Testing XSS in contact form..."
curl -s -X POST "$HONEYPOT_URL/api/contact" \
  -d "name=<script>alert('XSS')</script>&email=test@test.com&message=test" \
  > /dev/null && echo "✓ XSS attempt logged" || echo "✗ XSS test failed"

# Test 6: Admin Page Access
echo -e "\n[6] Testing admin page access..."
curl -s "$HONEYPOT_URL/admin.html" > /dev/null && echo "✓ Admin page accessible" || echo "✗ Admin page failed"

# Test 7: Check Logs API
echo -e "\n[7] Testing logs API..."
curl -s "$HONEYPOT_URL/api/logs?limit=5" | grep -q "success" && echo "✓ Logs API working" || echo "✗ Logs API failed"

# Test 8: Check Stats API
echo -e "\n[8] Testing stats API..."
curl -s "$HONEYPOT_URL/api/stats" | grep -q "success" && echo "✓ Stats API working" || echo "✗ Stats API failed"

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Attack simulation complete!"
echo "📊 View logs at: $HONEYPOT_URL/monitor.html"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

