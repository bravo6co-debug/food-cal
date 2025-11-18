import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/ingredients - Get all ingredients
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const ingredients = await prisma.ingredient.findMany({
      where,
      include: {
        supplierProducts: {
          include: {
            supplier: {
              select: {
                id: true,
                companyName: true,
                region: true,
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(ingredients)
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    )
  }
}

// POST /api/ingredients - Create a new ingredient (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can create ingredients.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, category, unit } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Ingredient name is required' },
        { status: 400 }
      )
    }

    // Check if ingredient already exists
    const existing = await prisma.ingredient.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ingredient already exists' },
        { status: 409 }
      )
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        category,
        unit: unit || 'g',
      }
    })

    return NextResponse.json(ingredient, { status: 201 })
  } catch (error) {
    console.error('Error creating ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    )
  }
}
