import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { calculateRecipeCost, calculateMargin } from "@/lib/utils/cost-calculator"

// GET /api/menus - Get menus for current restaurant
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Unauthorized. Only restaurant owners can view menus.' },
        { status: 403 }
      )
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: session.user.id }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant profile not found' },
        { status: 404 }
      )
    }

    const menus = await prisma.menu.findMany({
      where: {
        restaurantId: restaurant.id
      },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: {
                  include: {
                    supplierProducts: {
                      include: {
                        supplier: {
                          select: {
                            companyName: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate cost and margin for each menu
    const menusWithCost = menus.map(menu => {
      let cost = 0
      let margin = null

      if (menu.recipe) {
        const costBreakdown = calculateRecipeCost(
          menu.recipe.name,
          menu.recipe.servings || 1,
          menu.recipe.ingredients
        )
        cost = costBreakdown.costPerServing

        if (menu.salePrice) {
          margin = calculateMargin(cost, menu.salePrice)
        }
      }

      return {
        ...menu,
        cost,
        margin,
      }
    })

    return NextResponse.json(menusWithCost)
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}

// POST /api/menus - Create a new menu item
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Unauthorized. Only restaurant owners can create menus.' },
        { status: 403 }
      )
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: session.user.id }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, recipeId, salePrice, targetMargin } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Menu name is required' },
        { status: 400 }
      )
    }

    const menu = await prisma.menu.create({
      data: {
        restaurantId: restaurant.id,
        name,
        recipeId,
        salePrice,
        targetMargin,
      },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(menu, { status: 201 })
  } catch (error) {
    console.error('Error creating menu:', error)
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    )
  }
}
