import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { calculateRecipeCost, calculateMargin } from "@/lib/utils/cost-calculator"

export default async function MenusPage() {
  const session = await auth()

  if (!session || session.user.role !== 'OWNER') {
    redirect('/dashboard')
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id }
  })

  if (!restaurant) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            레스토랑 프로필이 필요합니다
          </h3>
          <p className="text-gray-600">
            먼저 프로필을 완성해주세요.
          </p>
        </div>
      </div>
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

  // Calculate costs and margins
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">메뉴 관리</h1>
          <p className="mt-2 text-gray-600">
            메뉴별 원가와 마진을 확인하고 관리하세요
          </p>
        </div>
      </div>

      {menusWithCost.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 등록된 메뉴가 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            레시피를 선택하여 메뉴를 추가해보세요
          </p>
          <a
            href="/dashboard/recipes"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            레시피 찾기
          </a>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {menusWithCost.map((menu) => (
              <li key={menu.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {menu.name}
                      </h3>
                      {menu.recipe && (
                        <p className="mt-1 text-sm text-gray-500">
                          레시피: {menu.recipe.name}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex items-center space-x-8">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">원가</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₩{menu.cost.toLocaleString()}
                        </p>
                      </div>
                      {menu.salePrice && (
                        <>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">판매가</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ₩{menu.salePrice.toLocaleString()}
                            </p>
                          </div>
                          {menu.margin && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500">마진율</p>
                              <p className={`text-lg font-semibold ${
                                menu.margin.marginPercentage >= 60 ? 'text-green-600' :
                                menu.margin.marginPercentage >= 40 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {menu.margin.marginPercentage.toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      <div>
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          menu.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {menu.isActive ? '판매중' : '판매중지'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {menu.targetMargin && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        목표 마진율: {menu.targetMargin}%
                        {menu.margin && (
                          <span className={`ml-2 ${
                            menu.margin.marginPercentage >= menu.targetMargin
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {menu.margin.marginPercentage >= menu.targetMargin
                              ? '✓ 달성'
                              : '✗ 미달성'
                            }
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
