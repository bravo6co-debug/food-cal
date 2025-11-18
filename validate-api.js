#!/usr/bin/env node

/**
 * Food-Cal API Structure Validator
 * API 엔드포인트 파일들의 구조를 검증합니다
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Food-Cal API Structure Validation\n');

const apiRoutes = [
  {
    path: 'src/app/api/auth/register/route.ts',
    name: 'User Registration',
    methods: ['POST'],
    description: '회원가입 및 프로필 생성'
  },
  {
    path: 'src/app/api/auth/[...nextauth]/route.ts',
    name: 'NextAuth Handler',
    methods: ['GET', 'POST'],
    description: 'NextAuth 인증 처리'
  },
  {
    path: 'src/app/api/profile/route.ts',
    name: 'Profile Management',
    methods: ['GET', 'PUT'],
    description: '프로필 조회 및 수정'
  },
  {
    path: 'src/app/api/recipes/route.ts',
    name: 'Recipes',
    methods: ['GET', 'POST'],
    description: '레시피 목록 조회 및 생성'
  },
  {
    path: 'src/app/api/recipes/[id]/cost/route.ts',
    name: 'Recipe Cost Calculator',
    methods: ['GET'],
    description: '레시피 원가 계산'
  },
  {
    path: 'src/app/api/ingredients/route.ts',
    name: 'Ingredients',
    methods: ['GET', 'POST'],
    description: '식재료 목록 조회 및 생성'
  },
  {
    path: 'src/app/api/suppliers/route.ts',
    name: 'Suppliers',
    methods: ['GET', 'POST'],
    description: '공급업체 목록 조회 및 프로필 생성'
  },
  {
    path: 'src/app/api/menus/route.ts',
    name: 'Menus',
    methods: ['GET', 'POST'],
    description: '메뉴 목록 조회 및 생성'
  }
];

const utilityFiles = [
  {
    path: 'src/lib/auth.ts',
    name: 'Authentication Config',
    description: 'NextAuth 설정'
  },
  {
    path: 'src/lib/prisma.ts',
    name: 'Prisma Client',
    description: 'Prisma 데이터베이스 클라이언트'
  },
  {
    path: 'src/lib/utils/cost-calculator.ts',
    name: 'Cost Calculator',
    description: '원가 계산 유틸리티'
  }
];

let totalChecks = 0;
let passedChecks = 0;

function checkFile(filePath, name, methods, description) {
  totalChecks++;
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${name}`);
    console.log(`   Path: ${filePath}`);
    console.log(`   Error: File not found\n`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');

  // Check for HTTP methods
  let methodsFound = [];
  if (methods) {
    methods.forEach(method => {
      const regex = new RegExp(`export\\s+(async\\s+)?function\\s+${method}`, 'g');
      if (regex.test(content)) {
        methodsFound.push(method);
      }
    });
  }

  const allMethodsPresent = !methods || methodsFound.length === methods.length;

  if (allMethodsPresent) {
    passedChecks++;
    console.log(`✅ ${name}`);
    console.log(`   Path: ${filePath}`);
    if (methods) {
      console.log(`   Methods: ${methodsFound.join(', ')}`);
    }
    console.log(`   Description: ${description}\n`);
    return true;
  } else {
    console.log(`⚠️  ${name}`);
    console.log(`   Path: ${filePath}`);
    console.log(`   Expected: ${methods?.join(', ')}`);
    console.log(`   Found: ${methodsFound.join(', ') || 'none'}`);
    console.log(`   Description: ${description}\n`);
    return false;
  }
}

console.log('📡 API Routes\n');
console.log('=' .repeat(60) + '\n');

apiRoutes.forEach(route => {
  checkFile(route.path, route.name, route.methods, route.description);
});

console.log('\n🛠️  Utility Files\n');
console.log('=' .repeat(60) + '\n');

utilityFiles.forEach(file => {
  checkFile(file.path, file.name, null, file.description);
});

console.log('=' .repeat(60));
console.log(`\n📊 Validation Summary: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('✨ All API files are properly structured!\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${totalChecks - passedChecks} issues found\n`);
  process.exit(1);
}
