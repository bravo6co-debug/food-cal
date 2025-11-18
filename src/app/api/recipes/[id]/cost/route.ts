import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { calculateRecipeCost } from "@/lib/utils/cost-calculator"

// GET /api/recipes/:id/cost - Calculate cost for a recipe
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipeId = params.id

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
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
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    const costBreakdown = calculateRecipeCost(
      recipe.name,
      recipe.servings || 1,
      recipe.ingredients
    )

    return NextResponse.json({
      recipeId: recipe.id,
      recipeName: recipe.name,
      servings: recipe.servings,
      ...costBreakdown,
    })
  } catch (error) {
    console.error('Error calculating recipe cost:', error)
    return NextResponse.json(
      { error: 'Failed to calculate recipe cost' },
      { status: 500 }
    )
  }
}
