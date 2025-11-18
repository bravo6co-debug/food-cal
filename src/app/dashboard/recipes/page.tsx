import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function RecipesPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  let recipes = []

  if (session.user.role === 'CHEF') {
    // Show chef's own recipes
    const chef = await prisma.chef.findUnique({
      where: { userId: session.user.id },
      include: {
        recipes: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    recipes = chef?.recipes || []
  } else {
    // Show public recipes for restaurant owners
    recipes = await prisma.recipe.findMany({
      where: {
        visibility: 'PUBLIC'
      },
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
            ingredient: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {session.user.role === 'CHEF' ? '내 레시피' : '레시피 찾기'}
          </h1>
          <p className="mt-2 text-gray-600">
            {session.user.role === 'CHEF'
              ? '등록한 레시피를 관리하고 원가를 확인하세요'
              : '셰프들이 공유한 레시피를 찾아보세요'
            }
          </p>
        </div>
        {session.user.role === 'CHEF' && (
          <Link
            href="/dashboard/recipes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + 레시피 작성
          </Link>
        )}
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {session.user.role === 'CHEF' ? '아직 레시피가 없습니다' : '공개된 레시피가 없습니다'}
          </h3>
          <p className="text-gray-600">
            {session.user.role === 'CHEF'
              ? '첫 번째 레시피를 작성해보세요!'
              : '셰프들이 레시피를 공유하면 여기에 표시됩니다.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe: any) => (
            <div key={recipe.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {recipe.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    recipe.visibility === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                    recipe.visibility === 'PRIVATE' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {recipe.visibility === 'PUBLIC' ? '공개' :
                     recipe.visibility === 'PRIVATE' ? '비공개' : '제휴'}
                  </span>
                </div>

                {recipe.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500">
                  {session.user.role !== 'CHEF' && recipe.chef && (
                    <div className="flex items-center">
                      <span className="mr-2">👨‍🍳</span>
                      <span>{recipe.chef.user.name}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="mr-2">🥘</span>
                    <span>{recipe.servings ? `${recipe.servings}인분` : '인분 미지정'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🧂</span>
                    <span>{recipe.ingredients.length}개 재료</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dashboard/recipes/${recipe.id}`}
                    className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    상세보기
                  </Link>
                  <Link
                    href={`/dashboard/recipes/${recipe.id}/cost`}
                    className="flex-1 text-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    원가 계산
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
