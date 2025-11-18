import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { calculateRecipeCost, findBestPrice } from "@/lib/utils/cost-calculator"

export default async function RecipeCostPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: {
      chef: {
        include: {
          user: {
            select: {
              name: true,
            }
          }
        }
      },
      ingredients: {
        include: {
          ingredient: {
            include: {
              supplierProducts: {
                include: {
                  supplier: {
                    select: {
                      id: true,
                      companyName: true,
                      region: true,
                      phone: true,
                    }
                  }
                },
                orderBy: {
                  price: 'asc'
                }
              }
            }
          }
        }
      }
    }
  })

  if (!recipe) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            레시피를 찾을 수 없습니다
          </h3>
        </div>
      </div>
    )
  }

  const costBreakdown = calculateRecipeCost(
    recipe.name,
    recipe.servings || 1,
    recipe.ingredients
  )

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
        <p className="mt-2 text-gray-600">
          셰프: {recipe.chef.user.name} | {recipe.servings}인분
        </p>
      </div>

      {/* Cost Summary */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">원가 요약</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">총 원가</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="text-2xl font-bold text-blue-600">
                  ₩{costBreakdown.totalCost.toLocaleString()}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">1인분 원가</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="text-2xl font-bold text-green-600">
                  ₩{costBreakdown.costPerServing.toLocaleString()}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">재료 수</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {costBreakdown.ingredients.length}개
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Ingredient Cost Breakdown */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">재료별 원가 상세</h2>
          <p className="mt-1 text-sm text-gray-500">
            각 재료별로 최저가 공급업체를 확인하세요
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {costBreakdown.ingredients.map((ingredientCost, index) => {
              const recipeIngredient = recipe.ingredients.find(
                ri => ri.ingredientId === ingredientCost.ingredientId
              )
              const allProducts = recipeIngredient?.ingredient.supplierProducts || []

              return (
                <li key={index} className="px-4 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900">
                        {ingredientCost.ingredientName}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        필요량: {ingredientCost.quantity}{ingredientCost.unit}
                      </p>
                      {recipeIngredient?.notes && (
                        <p className="mt-1 text-sm text-gray-400">
                          비고: {recipeIngredient.notes}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm text-gray-500">재료 원가</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ₩{ingredientCost.totalCost.toLocaleString()}
                      </p>
                      {ingredientCost.bestPrice > 0 && (
                        <p className="text-xs text-gray-500">
                          단가: ₩{ingredientCost.bestPrice.toLocaleString()}/{ingredientCost.unit}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Supplier Comparison */}
                  {allProducts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">
                        공급업체 비교 ({allProducts.length}개)
                      </h5>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {allProducts.map((product, idx) => {
                          const isBest = ingredientCost.supplier?.id === product.supplierId
                          return (
                            <div
                              key={idx}
                              className={`border rounded p-3 ${
                                isBest ? 'border-green-500 bg-green-50' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {product.supplier.companyName}
                                    {isBest && (
                                      <span className="ml-2 text-xs text-green-600">
                                        ✓ 최저가
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {product.productName}
                                  </p>
                                  {product.brand && (
                                    <p className="text-xs text-gray-400">
                                      브랜드: {product.brand}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {product.specification}
                                  </p>
                                </div>
                                <div className="ml-2 text-right">
                                  <p className="text-sm font-semibold text-gray-900">
                                    ₩{product.price.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {product.unit}
                                  </p>
                                </div>
                              </div>
                              {product.supplier.region && (
                                <p className="text-xs text-gray-400 mt-1">
                                  📍 {product.supplier.region}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {allProducts.length === 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ⚠️ 등록된 공급업체가 없습니다
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
