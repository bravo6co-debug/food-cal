#!/bin/bash

# Quick API Test - 서버가 실행 중이어야 합니다
# Usage: ./quick-test.sh

BASE_URL="http://localhost:3000"

echo "======================================"
echo "Food-Cal Quick API Test"
echo "======================================"
echo ""
echo "서버가 $BASE_URL 에서 실행 중인지 확인하세요"
echo ""

# Check if server is running
echo "1️⃣  서버 연결 확인..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|404"; then
    echo "✅ 서버 연결 성공"
else
    echo "❌ 서버에 연결할 수 없습니다"
    echo "   먼저 'npm run dev'로 서버를 실행하세요"
    exit 1
fi
echo ""

# Test 1: Register new user
echo "2️⃣  회원가입 테스트..."
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test$TIMESTAMP@test.com\",
    \"password\": \"test123456\",
    \"name\": \"테스트유저$TIMESTAMP\",
    \"role\": \"OWNER\",
    \"profileData\": {
      \"restaurantName\": \"테스트식당$TIMESTAMP\",
      \"phone\": \"02-1234-5678\"
    }
  }")

if echo "$REGISTER_RESPONSE" | jq -e '.user.email' > /dev/null 2>&1; then
    echo "✅ 회원가입 성공"
    echo "   이메일: $(echo $REGISTER_RESPONSE | jq -r '.user.email')"
    echo "   역할: $(echo $REGISTER_RESPONSE | jq -r '.user.role')"
else
    echo "⚠️  회원가입 실패 또는 중복"
    echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
fi
echo ""

# Test 2: Get ingredients
echo "3️⃣  식재료 목록 조회..."
INGREDIENTS=$(curl -s "$BASE_URL/api/ingredients")
INGREDIENT_COUNT=$(echo "$INGREDIENTS" | jq 'length' 2>/dev/null || echo "0")

if [ "$INGREDIENT_COUNT" -gt 0 ]; then
    echo "✅ 식재료 $INGREDIENT_COUNT 개 조회 성공"
    echo ""
    echo "📋 샘플 식재료:"
    echo "$INGREDIENTS" | jq -r '.[0:3][] | "   - \(.name) (\(.category)) - 공급업체: \(.supplierProducts | length)개"' 2>/dev/null
else
    echo "ℹ️  등록된 식재료가 없습니다"
    echo "   'npm run db:seed'를 실행하여 샘플 데이터를 생성하세요"
fi
echo ""

# Test 3: Get recipes
echo "4️⃣  레시피 목록 조회..."
RECIPES=$(curl -s "$BASE_URL/api/recipes")
RECIPE_COUNT=$(echo "$RECIPES" | jq 'length' 2>/dev/null || echo "0")

if [ "$RECIPE_COUNT" -gt 0 ]; then
    echo "✅ 레시피 $RECIPE_COUNT 개 조회 성공"
    echo ""
    echo "📖 레시피 목록:"
    echo "$RECIPES" | jq -r '.[] | "   - \(.name) (\(.servings)인분) by \(.chef.user.name)"' 2>/dev/null

    # Get first recipe ID for cost calculation
    RECIPE_ID=$(echo "$RECIPES" | jq -r '.[0].id' 2>/dev/null)

    if [ "$RECIPE_ID" != "null" ] && [ -n "$RECIPE_ID" ]; then
        echo ""
        echo "5️⃣  원가 계산 테스트..."
        COST=$(curl -s "$BASE_URL/api/recipes/$RECIPE_ID/cost")

        if echo "$COST" | jq -e '.totalCost' > /dev/null 2>&1; then
            echo "✅ 원가 계산 성공"
            echo ""
            echo "💰 원가 정보:"
            echo "   레시피: $(echo $COST | jq -r '.recipeName')"
            echo "   총 원가: ₩$(echo $COST | jq -r '.totalCost | floor')"
            echo "   1인분: ₩$(echo $COST | jq -r '.costPerServing | floor')"
            echo "   재료 수: $(echo $COST | jq -r '.ingredients | length')개"
        else
            echo "⚠️  원가 계산 실패"
        fi
    fi
else
    echo "ℹ️  등록된 레시피가 없습니다"
    echo "   'npm run db:seed'를 실행하여 샘플 데이터를 생성하세요"
fi
echo ""

# Test 4: Get suppliers
echo "6️⃣  공급업체 목록 조회..."
SUPPLIERS=$(curl -s "$BASE_URL/api/suppliers")
SUPPLIER_COUNT=$(echo "$SUPPLIERS" | jq 'length' 2>/dev/null || echo "0")

if [ "$SUPPLIER_COUNT" -gt 0 ]; then
    echo "✅ 공급업체 $SUPPLIER_COUNT 개 조회 성공"
    echo ""
    echo "🚚 공급업체 목록:"
    echo "$SUPPLIERS" | jq -r '.[] | "   - \(.companyName) (\(.region)) - 상품: \(.products | length)개"' 2>/dev/null
else
    echo "ℹ️  등록된 공급업체가 없습니다"
fi
echo ""

echo "======================================"
echo "✨ API 테스트 완료"
echo "======================================"
echo ""
echo "📚 더 자세한 테스트:"
echo "   - API_DOCUMENTATION.md 참고"
echo "   - API_TEST_PLAN.md 참고"
echo ""
echo "🌐 웹 UI 테스트:"
echo "   - http://localhost:3000 (랜딩 페이지)"
echo "   - http://localhost:3000/auth/signup (회원가입)"
echo "   - http://localhost:3000/auth/signin (로그인)"
echo ""
echo "🔐 테스트 계정 (시드 데이터 실행 후):"
echo "   - chef@foodcal.com / password123"
echo "   - owner@foodcal.com / password123"
echo "   - supplier1@foodcal.com / password123"
echo ""
