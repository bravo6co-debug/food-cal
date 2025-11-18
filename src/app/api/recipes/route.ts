import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/recipes - Get all recipes (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const visibility = searchParams.get('visibility')
    const chefId = searchParams.get('chefId')

    const where: any = {}

    if (visibility) {
      where.visibility = visibility
    } else {
      // Default to public recipes if not authenticated
      where.visibility = 'PUBLIC'
    }

    if (chefId) {
      where.chefId = chefId
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        chef: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        ingredients: {
          include: {
            ingredient: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create a new recipe (Chef only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'CHEF') {
      return NextResponse.json(
        { error: 'Unauthorized. Only chefs can create recipes.' },
        { status: 403 }
      )
    }

    const chef = await prisma.chef.findUnique({
      where: { userId: session.user.id }
    })

    if (!chef) {
      return NextResponse.json(
        { error: 'Chef profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, servings, visibility, ingredients } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Recipe name is required' },
        { status: 400 }
      )
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        description,
        servings,
        visibility: visibility || 'PUBLIC',
        chefId: chef.id,
        ingredients: {
          create: ingredients?.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes,
          })) || []
        }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          }
        }
      }
    })

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
