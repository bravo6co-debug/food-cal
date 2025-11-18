# Food-Cal API 테스트 플랜

## 준비사항

### 1. 데이터베이스 설정
```bash
# 로컬 PostgreSQL이 설치되어 있어야 합니다
# 또는 Prisma의 자동 데이터베이스 사용

# 마이그레이션 실행
npx prisma migrate dev --name init

# 시드 데이터 생성
npm run db:seed
```

### 2. 개발 서버 실행
```bash
npm run dev
# 서버가 http://localhost:3000 에서 실행됩니다
```

---

## 테스트 시나리오

### Scenario 1: 회원가입 및 로그인 플로우

#### 1-1. 식당 운영자 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newowner@test.com",
    "password": "test123456",
    "name": "김사장",
    "role": "OWNER",
    "profileData": {
      "restaurantName": "김사장 식당",
      "address": "서울시 강남구",
      "phone": "02-1234-5678"
    }
  }'

# Expected: 201 Created
# {
#   "message": "User created successfully",
#   "user": { "id": "...", "email": "newowner@test.com", "role": "OWNER" }
# }
```

#### 1-2. 셰프 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newchef@test.com",
    "password": "test123456",
    "name": "박셰프",
    "role": "CHEF",
    "profileData": {
      "bio": "한식 전문 셰프",
      "specialty": "한식",
      "experience": 10
    }
  }'

# Expected: 201 Created
```

#### 1-3. 공급업체 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newsupplier@test.com",
    "password": "test123456",
    "name": "이대표",
    "role": "SUPPLIER",
    "profileData": {
      "companyName": "프레시 푸드",
      "region": "서울",
      "phone": "02-9999-8888",
      "deliveryInfo": "당일 배송"
    }
  }'

# Expected: 201 Created
```

#### 1-4. 중복 가입 시도
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newowner@test.com",
    "password": "test123456",
    "name": "김사장",
    "role": "OWNER",
    "profileData": {}
  }'

# Expected: 409 Conflict
# { "error": "User with this email already exists" }
```

---

### Scenario 2: 레시피 조회

#### 2-1. 공개 레시피 목록
```bash
curl http://localhost:3000/api/recipes

# Expected: 200 OK
# Array of recipes with PUBLIC visibility
```

#### 2-2. 공개 레시피만 필터링
```bash
curl "http://localhost:3000/api/recipes?visibility=PUBLIC"

# Expected: 200 OK
```

#### 2-3. 특정 셰프의 레시피
```bash
# 먼저 셰프 ID를 알아야 합니다 (시드 데이터에서)
curl "http://localhost:3000/api/recipes?chefId=CHEF_ID"

# Expected: 200 OK
```

---

### Scenario 3: 식재료 조회

#### 3-1. 모든 식재료 목록
```bash
curl http://localhost:3000/api/ingredients

# Expected: 200 OK
# Array of ingredients with supplier products
```

#### 3-2. 카테고리별 필터링
```bash
curl "http://localhost:3000/api/ingredients?category=육류"

# Expected: 200 OK
# Only meat ingredients
```

#### 3-3. 이름 검색
```bash
curl "http://localhost:3000/api/ingredients?search=소고기"

# Expected: 200 OK
# Ingredients matching "소고기"
```

---

### Scenario 4: 공급업체 조회

#### 4-1. 모든 공급업체 목록
```bash
curl http://localhost:3000/api/suppliers

# Expected: 200 OK
# Array of suppliers with products
```

#### 4-2. 지역별 필터링
```bash
curl "http://localhost:3000/api/suppliers?region=경기도"

# Expected: 200 OK
# Suppliers in Gyeonggi-do
```

---

### Scenario 5: 원가 계산

#### 5-1. 레시피 원가 계산
```bash
# 먼저 레시피 ID를 얻어야 합니다
RECIPE_ID=$(curl -s http://localhost:3000/api/recipes | jq -r '.[0].id')

curl "http://localhost:3000/api/recipes/$RECIPE_ID/cost"

# Expected: 200 OK
# {
#   "recipeId": "...",
#   "recipeName": "소고기 덮밥",
#   "totalCost": 32450,
#   "costPerServing": 8112.5,
#   "ingredients": [...]
# }
```

---

### Scenario 6: 인증이 필요한 엔드포인트 (브라우저 테스트)

이 테스트들은 브라우저에서 로그인 후 진행해야 합니다:

#### 6-1. 레시피 생성 (셰프만)
1. 브라우저에서 `/auth/signin` 접속
2. chef@foodcal.com / password123 로그인
3. API 테스트:

```bash
# 브라우저의 쿠키를 사용해야 하므로 직접 테스트는 어렵습니다
# 대신 웹 UI를 통해 테스트:
# - /dashboard/recipes/new 접속
# - 레시피 작성 양식 작성
# - 제출
```

#### 6-2. 메뉴 관리 (식당 운영자만)
1. owner@foodcal.com / password123 로그인
2. `/dashboard/menus` 접속
3. 메뉴 목록 확인

#### 6-3. 프로필 조회
1. 로그인 후
2. `/api/profile` 접속
3. 프로필 정보 확인

---

## 자동 테스트 실행

### 전체 테스트 스크립트
```bash
chmod +x test-api.sh
./test-api.sh
```

### 개별 테스트

#### 회원가입 테스트
```bash
# test-register.sh 생성
cat > test-register.sh << 'EOF'
#!/bin/bash
echo "Testing User Registration..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@test.com",
    "password": "test123456",
    "name": "테스트",
    "role": "OWNER",
    "profileData": {
      "restaurantName": "테스트 식당"
    }
  }' | jq '.'
EOF

chmod +x test-register.sh
./test-register.sh
```

#### 레시피 조회 테스트
```bash
echo "Testing Recipe List..."
curl -s http://localhost:3000/api/recipes | jq '.[0]'
```

#### 원가 계산 테스트
```bash
# 첫 번째 레시피의 원가 계산
RECIPE_ID=$(curl -s http://localhost:3000/api/recipes | jq -r '.[0].id')
curl -s "http://localhost:3000/api/recipes/$RECIPE_ID/cost" | jq '.'
```

---

## 예상 결과

### 성공적인 응답
✅ **200 OK** - 조회 성공
✅ **201 Created** - 생성 성공

### 에러 응답
❌ **400 Bad Request** - 잘못된 요청 (필수 필드 누락)
❌ **401 Unauthorized** - 인증 필요
❌ **403 Forbidden** - 권한 없음
❌ **404 Not Found** - 리소스 없음
❌ **409 Conflict** - 중복 (이미 존재하는 이메일 등)
❌ **500 Internal Server Error** - 서버 에러

---

## 테스트 체크리스트

### API 엔드포인트
- [ ] POST /api/auth/register - 회원가입
- [ ] GET /api/profile - 프로필 조회
- [ ] PUT /api/profile - 프로필 수정
- [ ] GET /api/recipes - 레시피 목록
- [ ] POST /api/recipes - 레시피 생성 (셰프)
- [ ] GET /api/recipes/:id/cost - 원가 계산
- [ ] GET /api/ingredients - 식재료 목록
- [ ] POST /api/ingredients - 식재료 생성 (관리자)
- [ ] GET /api/suppliers - 공급업체 목록
- [ ] POST /api/suppliers - 공급업체 프로필 생성
- [ ] GET /api/menus - 메뉴 목록 (식당 운영자)
- [ ] POST /api/menus - 메뉴 생성 (식당 운영자)

### 비즈니스 로직
- [ ] 원가 계산이 정확한가?
- [ ] 최저가 공급업체 선택이 올바른가?
- [ ] 마진율 계산이 정확한가?
- [ ] 역할별 권한이 올바르게 적용되는가?

### 데이터 무결성
- [ ] 중복 이메일 방지
- [ ] 필수 필드 검증
- [ ] 역할별 프로필 자동 생성

---

## 문제 해결

### 데이터베이스 연결 실패
```bash
# .env 파일 확인
cat .env

# Prisma 클라이언트 재생성
npx prisma generate

# 마이그레이션 재실행
npx prisma migrate reset
```

### 서버 실행 안됨
```bash
# 포트 확인
lsof -i :3000

# 의존성 재설치
rm -rf node_modules
npm install
```

### API 응답 없음
```bash
# 서버 로그 확인
# 개발 서버 터미널에서 에러 메시지 확인
```
