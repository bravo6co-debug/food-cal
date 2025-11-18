import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      restaurant: true,
      chef: {
        include: {
          recipes: true,
        }
      },
      supplier: {
        include: {
          products: true,
        }
      },
    }
  })

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {user?.name}님!
        </h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'OWNER' && '식당/카페 관리 대시보드입니다.'}
          {user?.role === 'CHEF' && '셰프 대시보드입니다.'}
          {user?.role === 'SUPPLIER' && '공급업체 관리 대시보드입니다.'}
          {user?.role === 'ADMIN' && '관리자 대시보드입니다.'}
        </p>
      </div>

      {/* Owner Dashboard */}
      {user?.role === 'OWNER' && user.restaurant && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🍽️</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      식당/카페 이름
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.restaurant.name}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📋</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      등록된 메뉴
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">💰</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      평균 원가율
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      --%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chef Dashboard */}
      {user?.role === 'CHEF' && user.chef && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📖</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      등록된 레시피
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.chef.recipes.length}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">👨‍🍳</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      전문 분야
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.chef.specialty || '미지정'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">⭐</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      경력
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.chef.experience ? `${user.chef.experience}년` : '미지정'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Dashboard */}
      {user?.role === 'SUPPLIER' && user.supplier && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🏢</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      회사명
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.supplier.companyName}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📦</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      등록된 상품
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.supplier.products.length}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📍</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      지역
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.supplier.region || '미지정'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
