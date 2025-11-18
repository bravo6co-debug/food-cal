#!/bin/bash

# Food-Cal API Test Script

echo "================================"
echo "Food-Cal API Test Script"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check - GET /api/ingredients (public endpoint)
echo -e "${BLUE}Test 1: GET /api/ingredients (식재료 목록)${NC}"
echo "Request: GET $BASE_URL/api/ingredients"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/ingredients")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Success (200)${NC}"
    echo "$BODY" | jq '.[0:2]' 2>/dev/null || echo "$BODY" | head -n 10
else
    echo -e "${RED}✗ Failed ($HTTP_STATUS)${NC}"
    echo "$BODY"
fi
echo ""

# Test 2: User Registration
echo -e "${BLUE}Test 2: POST /api/auth/register (회원가입)${NC}"
REGISTER_DATA='{
  "email": "test-owner@test.com",
  "password": "test123456",
  "name": "테스트 사장님",
  "role": "OWNER",
  "profileData": {
    "restaurantName": "테스트 식당",
    "address": "서울시 테스트구",
    "phone": "02-1234-5678"
  }
}'

echo "Request: POST $BASE_URL/api/auth/register"
echo "Body: $REGISTER_DATA"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "409" ]; then
    if [ "$HTTP_STATUS" = "201" ]; then
        echo -e "${GREEN}✓ User Created (201)${NC}"
    else
        echo -e "${BLUE}ℹ User Already Exists (409) - Using existing user${NC}"
    fi
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Failed ($HTTP_STATUS)${NC}"
    echo "$BODY"
fi
echo ""

# Test 3: User Registration - Chef
echo -e "${BLUE}Test 3: POST /api/auth/register (셰프 회원가입)${NC}"
CHEF_DATA='{
  "email": "test-chef@test.com",
  "password": "test123456",
  "name": "테스트 셰프",
  "role": "CHEF",
  "profileData": {
    "bio": "테스트용 셰프 계정입니다",
    "specialty": "한식",
    "experience": 5
  }
}'

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "$CHEF_DATA")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "409" ]; then
    if [ "$HTTP_STATUS" = "201" ]; then
        echo -e "${GREEN}✓ Chef Created (201)${NC}"
    else
        echo -e "${BLUE}ℹ Chef Already Exists (409)${NC}"
    fi
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Failed ($HTTP_STATUS)${NC}"
    echo "$BODY"
fi
echo ""

# Test 4: GET /api/recipes (공개 레시피 목록)
echo -e "${BLUE}Test 4: GET /api/recipes (레시피 목록)${NC}"
echo "Request: GET $BASE_URL/api/recipes"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/recipes")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Success (200)${NC}"
    RECIPE_COUNT=$(echo "$BODY" | jq 'length' 2>/dev/null)
    echo "Found $RECIPE_COUNT recipes"
    echo "$BODY" | jq '.[0]' 2>/dev/null || echo "$BODY" | head -n 20
else
    echo -e "${RED}✗ Failed ($HTTP_STATUS)${NC}"
    echo "$BODY"
fi
echo ""

# Test 5: GET /api/suppliers (공급업체 목록)
echo -e "${BLUE}Test 5: GET /api/suppliers (공급업체 목록)${NC}"
echo "Request: GET $BASE_URL/api/suppliers"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/suppliers")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Success (200)${NC}"
    SUPPLIER_COUNT=$(echo "$BODY" | jq 'length' 2>/dev/null)
    echo "Found $SUPPLIER_COUNT suppliers"
    echo "$BODY" | jq '.[0] | {id, companyName, region, productsCount: (.products | length)}' 2>/dev/null || echo "$BODY" | head -n 20
else
    echo -e "${RED}✗ Failed ($HTTP_STATUS)${NC}"
    echo "$BODY"
fi
echo ""

echo "================================"
echo "API Test Complete"
echo "================================"
echo ""
echo "Note: For authenticated endpoints (POST recipes, menus, etc.),"
echo "you need to log in through the web interface first."
