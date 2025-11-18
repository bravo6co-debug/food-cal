# Food-Cal - 식재료 원가 계산 및 B2B 플랫폼

레시피 관리, 원가 계산, 식재료 공급업체 비교를 한 번에 제공하는 B2B 플랫폼

## 프로젝트 목표

### 1차 목표 (MVP)
- 식당/카페의 메뉴 원가 정확한 계산
- 여러 공급업체 기준 재료 비교
- 합리적인 원재료 조달 지원

### 2차 목표
- 셰프 전문 레시피 마켓플레이스
- 레시피 → 원가 → 재료구매 원스톱 플랫폼

## 주요 사용자 역할

### 🍽️ 식당/카페 운영자 (Restaurant Owner)
- 메뉴 원가 계산 및 마진 확인
- 셰프 레시피 탐색 후 "내 메뉴로 가져오기"
- 재료별 공급업체 비교/문의

### 👨‍🍳 셰프 (Chef)
- 레시피 등록/관리
- 레시피 공개 설정 (공개/비공개/제휴 매장 한정)
- 레시피 사용 현황 및 원가 정보 확인

### 🚚 식재료 공급업체 (Supplier)
- 업체 프로필 관리 (지역, 배송 조건, 연락처)
- 판매 상품 등록 (식재료/브랜드/규격/가격)
- 견적/문의 요청 관리

### 👤 관리자 (Admin)
- 유저/콘텐츠 모니터링
- 신고 처리 및 업체 승인

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **Password Hashing**: bcryptjs

## 데이터베이스 모델

### 핵심 모델
- `User` - 사용자 (역할: OWNER, CHEF, SUPPLIER, ADMIN)
- `Restaurant` - 식당/카페 프로필
- `Chef` - 셰프 프로필
- `Supplier` - 공급업체 프로필
- `Recipe` - 레시피
- `Ingredient` - 식재료 마스터
- `RecipeIngredient` - 레시피-재료 관계 (수량 포함)
- `SupplierProduct` - 공급업체 판매 상품
- `Menu` - 식당 메뉴 (레시피 기반)
- `Inquiry` - 견적/문의

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 확인하고 필요시 수정:

```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 4. Prisma Client 생성

```bash
npx prisma generate
```

### 5. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 주요 API 엔드포인트

### 인증
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signout` - 로그아웃

### 레시피
- `GET /api/recipes` - 레시피 목록 조회
- `POST /api/recipes` - 레시피 생성 (셰프 전용)
- `GET /api/recipes/:id/cost` - 레시피 원가 계산

### 식재료
- `GET /api/ingredients` - 식재료 목록 조회
- `POST /api/ingredients` - 식재료 생성 (관리자 전용)

### 공급업체
- `GET /api/suppliers` - 공급업체 목록 조회
- `POST /api/suppliers` - 공급업체 프로필 생성

### 메뉴
- `GET /api/menus` - 메뉴 목록 조회 (식당 운영자 전용)
- `POST /api/menus` - 메뉴 생성 (식당 운영자 전용)

## 원가 계산 기능

`src/lib/utils/cost-calculator.ts`에 구현된 핵심 기능:

- **단위 변환**: 다양한 단위 간 자동 변환 (g, kg, ml, l 등)
- **최저가 검색**: 여러 공급업체 중 최저가 자동 계산
- **레시피 원가**: 전체 레시피 및 1인분 원가 계산
- **마진 계산**: 판매가 대비 마진율 계산

## 프로젝트 구조

```
food-cal/
├── prisma/
│   └── schema.prisma          # 데이터베이스 스키마
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # 인증
│   │   │   ├── recipes/       # 레시피
│   │   │   ├── ingredients/   # 식재료
│   │   │   ├── suppliers/     # 공급업체
│   │   │   └── menus/         # 메뉴
│   │   └── page.tsx           # 홈페이지
│   ├── components/            # React 컴포넌트
│   ├── lib/
│   │   ├── auth.ts            # NextAuth 설정
│   │   ├── prisma.ts          # Prisma 클라이언트
│   │   └── utils/
│   │       └── cost-calculator.ts  # 원가 계산 로직
│   └── types/
│       └── next-auth.d.ts     # NextAuth 타입 확장
├── .env                       # 환경 변수
├── .env.example               # 환경 변수 예제
├── package.json
└── README.md
```

## 다음 단계

### MVP 완성을 위한 추가 작업
- [ ] 프론트엔드 UI 구현 (로그인, 레시피 목록, 원가 계산 대시보드)
- [ ] 회원가입 기능 구현
- [ ] 공급업체 상품 등록 UI
- [ ] 레시피 상세 페이지 및 편집 기능
- [ ] 메뉴 관리 대시보드
- [ ] 견적/문의 시스템

### 2차 목표
- [ ] 레시피 마켓플레이스 UI
- [ ] 결제 시스템 통합
- [ ] 알림 기능
- [ ] 분석 및 리포팅 기능

## 라이선스

MIT
