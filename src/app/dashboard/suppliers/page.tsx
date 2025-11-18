import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function SuppliersPage() {
  const session = await auth()

  const suppliers = await prisma.supplier.findMany({
    include: {
      products: {
        include: {
          ingredient: true,
        }
      },
      user: {
        select: {
          email: true,
        }
      }
    },
    orderBy: {
      companyName: 'asc'
    }
  })

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">공급업체</h1>
        <p className="mt-2 text-gray-600">
          식재료를 공급하는 업체 목록을 확인하고 비교하세요
        </p>
      </div>

      {suppliers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🚚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            등록된 공급업체가 없습니다
          </h3>
          <p className="text-gray-600">
            공급업체가 등록되면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {supplier.companyName}
                </h3>

                {supplier.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {supplier.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500">
                  {supplier.region && (
                    <div className="flex items-center">
                      <span className="mr-2">📍</span>
                      <span>{supplier.region}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center">
                      <span className="mr-2">📞</span>
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="mr-2">📦</span>
                    <span>{supplier.products.length}개 상품</span>
                  </div>
                  {supplier.deliveryInfo && (
                    <div className="flex items-start">
                      <span className="mr-2">🚛</span>
                      <span className="line-clamp-2">{supplier.deliveryInfo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
