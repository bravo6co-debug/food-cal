# Food-Cal API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require authentication via NextAuth.js session cookies.

---

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

회원가입 및 프로필 생성

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "role": "OWNER | CHEF | SUPPLIER | ADMIN",
  "profileData": {
    // For OWNER:
    "restaurantName": "맛있는 식당",
    "description": "정성을 다하는 한식당",
    "address": "서울시 강남구",
    "phone": "02-1234-5678",

    // For CHEF:
    "bio": "20년 경력의 셰프",
    "specialty": "한식",
    "experience": 20,

    // For SUPPLIER:
    "companyName": "신선식자재",
    "description": "신선한 농산물 공급",
    "address": "경기도 안양시",
    "region": "경기도",
    "phone": "031-1111-2222",
    "email": "supplier@example.com",
    "deliveryInfo": "새벽 배송 가능"
  }
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "OWNER"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - User already exists

---

### 2. Sign In
**POST** `/api/auth/signin`

NextAuth.js 로그인 (자동 처리)

**Credentials:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### 3. Sign Out
**GET** `/api/auth/signout`

로그아웃

---

## Profile Endpoints

### 4. Get Profile
**GET** `/api/profile`

현재 로그인한 사용자의 프로필 조회

**Headers:**
```
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "id": "clxxx",
  "email": "user@example.com",
  "name": "홍길동",
  "role": "OWNER",
  "restaurant": {
    "id": "clxxx",
    "name": "맛있는 식당",
    "description": "정성을 다하는 한식당",
    "address": "서울시 강남구",
    "phone": "02-1234-5678"
  }
}
```

---

### 5. Update Profile
**PUT** `/api/profile`

프로필 수정

**Request Body:**
```json
{
  "name": "홍길동",
  "profileData": {
    "restaurantName": "맛있는 식당",
    "description": "업데이트된 설명",
    "address": "서울시 강남구",
    "phone": "02-1234-5678"
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "OWNER"
  }
}
```

---

## Recipe Endpoints

### 6. Get Recipes
**GET** `/api/recipes`

레시피 목록 조회

**Query Parameters:**
- `visibility` (optional): `PUBLIC` | `PRIVATE` | `PARTNER`
- `chefId` (optional): 특정 셰프의 레시피만 조회

**Example:**
```
GET /api/recipes?visibility=PUBLIC
GET /api/recipes?chefId=clxxx
```

**Response (200 OK):**
```json
[
  {
    "id": "clxxx",
    "name": "소고기 덮밥",
    "description": "달콤한 간장 소스에 볶은 소고기",
    "servings": 4,
    "visibility": "PUBLIC",
    "createdAt": "2025-01-01T00:00:00Z",
    "chef": {
      "id": "clxxx",
      "user": {
        "name": "김셰프"
      }
    },
    "ingredients": [
      {
        "id": "clxxx",
        "quantity": 400,
        "unit": "g",
        "notes": "불고기용으로 얇게 썰기",
        "ingredient": {
          "id": "clxxx",
          "name": "소고기",
          "category": "육류"
        }
      }
    ]
  }
]
```

---

### 7. Create Recipe
**POST** `/api/recipes`

레시피 생성 (셰프만 가능)

**Headers:**
```
Cookie: next-auth.session-token=...
```

**Request Body:**
```json
{
  "name": "소고기 덮밥",
  "description": "달콤한 간장 소스에 볶은 소고기를 올린 덮밥",
  "servings": 4,
  "visibility": "PUBLIC",
  "ingredients": [
    {
      "ingredientId": "clxxx",
      "quantity": 400,
      "unit": "g",
      "notes": "불고기용으로 얇게 썰기"
    },
    {
      "ingredientId": "clyyy",
      "quantity": 50,
      "unit": "g",
      "notes": "송송 썰기"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "clxxx",
  "name": "소고기 덮밥",
  "description": "달콤한 간장 소스에 볶은 소고기를 올린 덮밥",
  "servings": 4,
  "visibility": "PUBLIC",
  "ingredients": [...]
}
```

**Error Responses:**
- `403` - Not a chef
- `400` - Missing recipe name

---

### 8. Calculate Recipe Cost
**GET** `/api/recipes/:id/cost`

레시피 원가 계산

**Example:**
```
GET /api/recipes/clxxx/cost
```

**Response (200 OK):**
```json
{
  "recipeId": "clxxx",
  "recipeName": "소고기 덮밥",
  "servings": 4,
  "totalCost": 32450,
  "costPerServing": 8112.5,
  "ingredients": [
    {
      "ingredientId": "clxxx",
      "ingredientName": "소고기",
      "quantity": 400,
      "unit": "g",
      "bestPrice": 25,
      "totalCost": 10000,
      "supplier": {
        "id": "clyyy",
        "name": "신선식자재",
        "productName": "국내산 소고기 (불고기용)"
      }
    }
  ]
}
```

---

## Ingredient Endpoints

### 9. Get Ingredients
**GET** `/api/ingredients`

식재료 목록 조회

**Query Parameters:**
- `category` (optional): 카테고리별 필터링
- `search` (optional): 이름으로 검색

**Example:**
```
GET /api/ingredients?category=육류
GET /api/ingredients?search=소고기
```

**Response (200 OK):**
```json
[
  {
    "id": "clxxx",
    "name": "소고기",
    "category": "육류",
    "unit": "g",
    "supplierProducts": [
      {
        "id": "clyyy",
        "productName": "국내산 소고기",
        "brand": null,
        "specification": "1kg",
        "price": 25000,
        "unit": "1kg",
        "supplier": {
          "id": "clzzz",
          "companyName": "신선식자재",
          "region": "경기도"
        }
      }
    ]
  }
]
```

---

### 10. Create Ingredient
**POST** `/api/ingredients`

식재료 생성 (관리자만 가능)

**Headers:**
```
Cookie: next-auth.session-token=...
```

**Request Body:**
```json
{
  "name": "돼지고기",
  "category": "육류",
  "unit": "g"
}
```

**Response (201 Created):**
```json
{
  "id": "clxxx",
  "name": "돼지고기",
  "category": "육류",
  "unit": "g"
}
```

**Error Responses:**
- `403` - Not an admin
- `409` - Ingredient already exists

---

## Supplier Endpoints

### 11. Get Suppliers
**GET** `/api/suppliers`

공급업체 목록 조회

**Query Parameters:**
- `region` (optional): 지역별 필터링

**Example:**
```
GET /api/suppliers?region=경기도
```

**Response (200 OK):**
```json
[
  {
    "id": "clxxx",
    "companyName": "신선식자재",
    "description": "신선한 농산물을 공급합니다",
    "address": "경기도 안양시",
    "region": "경기도",
    "phone": "031-1111-2222",
    "email": "supplier@example.com",
    "deliveryInfo": "새벽 배송 가능, 최소 주문 5만원",
    "products": [
      {
        "id": "clyyy",
        "productName": "국내산 소고기",
        "price": 25000,
        "unit": "1kg",
        "ingredient": {
          "id": "clzzz",
          "name": "소고기"
        }
      }
    ]
  }
]
```

---

### 12. Create Supplier Profile
**POST** `/api/suppliers`

공급업체 프로필 생성 (공급업체 계정만 가능)

**Headers:**
```
Cookie: next-auth.session-token=...
```

**Request Body:**
```json
{
  "companyName": "신선식자재",
  "description": "신선한 농산물을 공급합니다",
  "address": "경기도 안양시",
  "region": "경기도",
  "phone": "031-1111-2222",
  "email": "supplier@example.com",
  "deliveryInfo": "새벽 배송 가능, 최소 주문 5만원"
}
```

**Response (201 Created):**
```json
{
  "id": "clxxx",
  "companyName": "신선식자재",
  "description": "신선한 농산물을 공급합니다",
  ...
}
```

**Error Responses:**
- `403` - Not a supplier account
- `409` - Supplier profile already exists

---

## Menu Endpoints

### 13. Get Menus
**GET** `/api/menus`

메뉴 목록 조회 (식당 운영자만 가능)

**Headers:**
```
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
[
  {
    "id": "clxxx",
    "name": "소고기 덮밥",
    "salePrice": 12000,
    "targetMargin": 60,
    "isActive": true,
    "recipe": {
      "id": "clyyy",
      "name": "소고기 덮밥",
      "servings": 4
    },
    "cost": 8112.5,
    "margin": {
      "marginAmount": 3887.5,
      "marginPercentage": 67.6
    }
  }
]
```

---

### 14. Create Menu
**POST** `/api/menus`

메뉴 생성 (식당 운영자만 가능)

**Headers:**
```
Cookie: next-auth.session-token=...
```

**Request Body:**
```json
{
  "name": "소고기 덮밥",
  "recipeId": "clxxx",
  "salePrice": 12000,
  "targetMargin": 60
}
```

**Response (201 Created):**
```json
{
  "id": "clxxx",
  "name": "소고기 덮밥",
  "salePrice": 12000,
  "targetMargin": 60,
  "isActive": true,
  "recipe": {...}
}
```

**Error Responses:**
- `403` - Not a restaurant owner
- `400` - Missing menu name

---

## Error Responses

모든 API 엔드포인트는 다음과 같은 에러 형식을 사용합니다:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Testing

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "테스트",
    "role": "OWNER",
    "profileData": {
      "restaurantName": "테스트 식당"
    }
  }'
```

**Get public recipes:**
```bash
curl http://localhost:3000/api/recipes
```

**Get ingredients:**
```bash
curl http://localhost:3000/api/ingredients
```

**Get suppliers:**
```bash
curl http://localhost:3000/api/suppliers
```

### Using the Test Script

```bash
./test-api.sh
```

---

## Test Accounts

After running the seed script (`npm run db:seed`), these accounts are available:

- **Admin:** admin@foodcal.com / password123
- **Chef:** chef@foodcal.com / password123
- **Owner:** owner@foodcal.com / password123
- **Supplier:** supplier1@foodcal.com / password123
