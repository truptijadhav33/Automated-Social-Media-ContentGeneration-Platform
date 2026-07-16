#!/bin/bash
set -e

BASE_URL="${API_URL:-http://localhost:5000}"
EMAIL="test-$(date +%s)@test.com"
PASSWORD="test1234"

echo "=== Publish Flow Smoke Test ==="
echo "API: $BASE_URL"
echo ""

# 1. Register
echo "1. Registering user..."
REGISTER_RES=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$REGISTER_RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")
if [ -z "$TOKEN" ]; then
  echo "FAIL: Register failed"
  echo "$REGISTER_RES"
  exit 1
fi
echo "   OK: token obtained"

# 2. Create brief
echo "2. Creating brief..."
BRIEF_RES=$(curl -s -X POST "$BASE_URL/api/briefs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"featureName":"Test Feature","description":"A test feature","keyBenefit":"Testing","platforms":["twitter"],"tone":"professional"}')
BRIEF_ID=$(echo "$BRIEF_RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['briefId'])" 2>/dev/null || echo "")
if [ -z "$BRIEF_ID" ]; then
  echo "FAIL: Create brief failed"
  echo "$BRIEF_RES"
  exit 1
fi
echo "   OK: briefId=$BRIEF_ID"

# 3. Generate content
echo "3. Generating content..."
GEN_RES=$(curl -s -X POST "$BASE_URL/api/content/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"briefId\":\"$BRIEF_ID\",\"platforms\":[\"twitter\"],\"tone\":\"professional\"}")
echo "$GEN_RES" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   OK' if d.get('success') else '   FAIL: '+str(d))" 2>/dev/null || echo "   WARN: parse failed"

# 4. Get content
echo "4. Fetching content..."
CONTENT_RES=$(curl -s "$BASE_URL/api/content/$BRIEF_ID" \
  -H "Authorization: Bearer $TOKEN")
CONTENT_ID=$(echo "$CONTENT_RES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['content'][0]['_id'])" 2>/dev/null || echo "")
if [ -z "$CONTENT_ID" ]; then
  echo "FAIL: No content found"
  echo "$CONTENT_RES"
  exit 1
fi
echo "   OK: contentId=$CONTENT_ID"

# 5. Publish (will fail without TWITTER_BEARER_TOKEN, but tests the route)
echo "5. Publishing..."
PUBLISH_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/content/$CONTENT_ID/publish" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
HTTP_CODE=$(echo "$PUBLISH_RES" | tail -1)
BODY=$(echo "$PUBLISH_RES" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "   OK: Published successfully"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "   EXPECTED FAIL (no Twitter token configured): $HTTP_CODE"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo "   UNEXPECTED: $HTTP_CODE"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

echo ""
echo "=== Done ==="
