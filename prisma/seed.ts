import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create users with different roles
  const password = await hash('password123', 12)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodcal.com' },
    update: {},
    create: {
      email: 'admin@foodcal.com',
      name: '관리자',
      password,
      role: 'ADMIN',
    },
  })
  console.log('Created admin user')

  // Create Chef
  const chef = await prisma.user.upsert({
    where: { email: 'chef@foodcal.com' },
    update: {},
    create: {
      email: 'chef@foodcal.com',
      name: '김셰프',
      password,
      role: 'CHEF',
      chef: {
        create: {
          bio: '20년 경력의 한식 전문 셰프입니다',
          specialty: '한식',
          experience: 20,
        },
      },
    },
  })
  console.log('Created chef user')

  // Create Restaurant Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@foodcal.com' },
    update: {},
    create: {
      email: 'owner@foodcal.com',
      name: '이사장',
      password,
      role: 'OWNER',
      restaurant: {
        create: {
          name: '맛있는 식당',
          description: '정성을 다하는 한식당입니다',
          address: '서울시 강남구',
          phone: '02-1234-5678',
        },
      },
    },
  })
  console.log('Created owner user')

  // Create Supplier
  const supplier1 = await prisma.user.upsert({
    where: { email: 'supplier1@foodcal.com' },
    update: {},
    create: {
      email: 'supplier1@foodcal.com',
      name: '박도매',
      password,
      role: 'SUPPLIER',
      supplier: {
        create: {
          companyName: '신선식자재',
          description: '신선한 농산물을 공급합니다',
          address: '경기도 안양시',
          region: '경기도',
          phone: '031-1111-2222',
          email: 'supplier1@foodcal.com',
          deliveryInfo: '새벽 배송 가능, 최소 주문 5만원',
        },
      },
    },
  })

  const supplier2 = await prisma.user.upsert({
    where: { email: 'supplier2@foodcal.com' },
    update: {},
    create: {
      email: 'supplier2@foodcal.com',
      name: '최공급',
      password,
      role: 'SUPPLIER',
      supplier: {
        create: {
          companyName: '프리미엄 푸드',
          description: '고급 식재료 전문 업체',
          address: '서울시 송파구',
          region: '서울',
          phone: '02-3333-4444',
          email: 'supplier2@foodcal.com',
          deliveryInfo: '당일 배송, 최소 주문 10만원',
        },
      },
    },
  })
  console.log('Created supplier users')

  // Create Ingredients
  const ingredients = await Promise.all([
    prisma.ingredient.upsert({
      where: { name: '쌀' },
      update: {},
      create: { name: '쌀', category: '곡류', unit: 'g' },
    }),
    prisma.ingredient.upsert({
      where: { name: '대파' },
      update: {},
      create: { name: '대파', category: '채소', unit: 'g' },
    }),
    prisma.ingredient.upsert({
      where: { name: '마늘' },
      update: {},
      create: { name: '마늘', category: '채소', unit: 'g' },
    }),
    prisma.ingredient.upsert({
      where: { name: '소고기' },
      update: {},
      create: { name: '소고기', category: '육류', unit: 'g' },
    }),
    prisma.ingredient.upsert({
      where: { name: '간장' },
      update: {},
      create: { name: '간장', category: '조미료', unit: 'ml' },
    }),
    prisma.ingredient.upsert({
      where: { name: '참기름' },
      update: {},
      create: { name: '참기름', category: '조미료', unit: 'ml' },
    }),
    prisma.ingredient.upsert({
      where: { name: '설탕' },
      update: {},
      create: { name: '설탕', category: '조미료', unit: 'g' },
    }),
    prisma.ingredient.upsert({
      where: { name: '달걀' },
      update: {},
      create: { name: '달걀', category: '계란/유제품', unit: 'ea' },
    }),
  ])
  console.log('Created ingredients')

  // Get supplier IDs
  const supplierProfiles = await prisma.supplier.findMany()
  const supplier1Id = supplierProfiles[0].id
  const supplier2Id = supplierProfiles[1].id

  // Create Supplier Products
  await prisma.supplierProduct.createMany({
    data: [
      // Supplier 1 products
      {
        supplierId: supplier1Id,
        ingredientId: ingredients[0].id, // 쌀
        productName: '경기미',
        brand: '농협',
        specification: '10kg',
        price: 35000,
        unit: '10kg',
        minOrder: 1,
      },
      {
        supplierId: supplier1Id,
        ingredientId: ingredients[1].id, // 대파
        productName: '신선 대파',
        specification: '1kg',
        price: 3000,
        unit: '1kg',
        minOrder: 1,
      },
      {
        supplierId: supplier1Id,
        ingredientId: ingredients[2].id, // 마늘
        productName: '깐마늘',
        brand: '햇마늘',
        specification: '500g',
        price: 8000,
        unit: '500g',
        minOrder: 1,
      },
      {
        supplierId: supplier1Id,
        ingredientId: ingredients[3].id, // 소고기
        productName: '국내산 소고기 (불고기용)',
        specification: '1kg',
        price: 25000,
        unit: '1kg',
        minOrder: 1,
      },
      // Supplier 2 products (premium, higher prices)
      {
        supplierId: supplier2Id,
        ingredientId: ingredients[0].id, // 쌀
        productName: '프리미엄 쌀',
        brand: '이천쌀',
        specification: '10kg',
        price: 45000,
        unit: '10kg',
        minOrder: 1,
      },
      {
        supplierId: supplier2Id,
        ingredientId: ingredients[1].id, // 대파
        productName: '유기농 대파',
        brand: '친환경',
        specification: '1kg',
        price: 5000,
        unit: '1kg',
        minOrder: 1,
      },
      {
        supplierId: supplier2Id,
        ingredientId: ingredients[3].id, // 소고기
        productName: '한우 1++ (불고기용)',
        brand: '한우',
        specification: '1kg',
        price: 55000,
        unit: '1kg',
        minOrder: 1,
      },
      {
        supplierId: supplier2Id,
        ingredientId: ingredients[4].id, // 간장
        productName: '양조간장',
        brand: '샘표',
        specification: '1L',
        price: 12000,
        unit: '1L',
        minOrder: 1,
      },
      {
        supplierId: supplier2Id,
        ingredientId: ingredients[5].id, // 참기름
        productName: '참기름',
        brand: '오뚜기',
        specification: '500ml',
        price: 15000,
        unit: '500ml',
        minOrder: 1,
      },
    ],
  })
  console.log('Created supplier products')

  // Create Recipe
  const chefProfile = await prisma.chef.findUnique({
    where: { userId: chef.id },
  })

  if (chefProfile) {
    const recipe = await prisma.recipe.create({
      data: {
        chefId: chefProfile.id,
        name: '소고기 덮밥',
        description: '달콤한 간장 소스에 볶은 소고기를 올린 덮밥입니다',
        servings: 4,
        visibility: 'PUBLIC',
        ingredients: {
          create: [
            {
              ingredientId: ingredients[0].id, // 쌀
              quantity: 600,
              unit: 'g',
              notes: '밥 4공기',
            },
            {
              ingredientId: ingredients[3].id, // 소고기
              quantity: 400,
              unit: 'g',
              notes: '불고기용으로 얇게 썰기',
            },
            {
              ingredientId: ingredients[1].id, // 대파
              quantity: 50,
              unit: 'g',
              notes: '송송 썰기',
            },
            {
              ingredientId: ingredients[2].id, // 마늘
              quantity: 20,
              unit: 'g',
              notes: '다지기',
            },
            {
              ingredientId: ingredients[4].id, // 간장
              quantity: 60,
              unit: 'ml',
            },
            {
              ingredientId: ingredients[5].id, // 참기름
              quantity: 15,
              unit: 'ml',
            },
            {
              ingredientId: ingredients[6].id, // 설탕
              quantity: 30,
              unit: 'g',
            },
            {
              ingredientId: ingredients[7].id, // 달걀
              quantity: 4,
              unit: 'ea',
              notes: '반숙 프라이',
            },
          ],
        },
      },
    })
    console.log('Created recipe')
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
