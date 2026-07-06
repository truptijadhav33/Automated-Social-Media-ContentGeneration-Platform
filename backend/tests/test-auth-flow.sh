#!/bin/bash
BASE="http://localhost:5000"

echo "=== 1. Register ==="
REGISTER=$(curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}')
echo $REGISTER

TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

echo ""
echo "=== 2. Login ==="
curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

echo ""
echo "=== 3. Create Brief (with token) ==="
BRIEF=$(curl -s -X POST $BASE/api/briefs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"featureName":"Test Feature","description":"Testing auth flow","keyBenefit":"It works","platforms":["linkedin"],"tone":"professional"}')
echo $BRIEF

BRIEF_ID=$(echo $BRIEF | grep -o '"briefId":"[^"]*"' | cut -d'"' -f4)
echo "Brief ID: $BRIEF_ID"

echo ""
echo "=== 4. Generate Content (with token) ==="
curl -s -X POST $BASE/api/content/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"briefId\":\"$BRIEF_ID\",\"tone\":\"professional\",\"platforms\":[\"linkedin\"]}"

echo ""
echo "=== 5. Attempt without token (should 401) ==="
curl -s -X GET $BASE/api/briefs

echo ""
echo "=== Done ==="
