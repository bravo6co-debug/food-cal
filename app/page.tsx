import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Food-Cal</h1>
            </div>
            <div className="flex gap-4">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            식재료 원가 계산 및 B2B 플랫폼
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            레시피 관리, 원가 계산, 식재료 공급업체 비교를 한 번에
          </p>

          <div className="flex justify-center gap-4 mb-20">
            <Link
              href="/auth/signup"
              className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-3 text-lg font-medium text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50"
            >
              로그인
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">식당/카페 운영자</h3>
              <p className="text-gray-600">
                메뉴 원가 계산 및 마진 확인
                <br />
                재료별 공급업체 비교/문의
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-semibold mb-2">셰프</h3>
              <p className="text-gray-600">
                레시피 등록 및 공유
                <br />
                레시피 사용 현황 확인
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">식재료 공급업체</h3>
              <p className="text-gray-600">
                상품 등록 및 판매
                <br />
                견적/문의 요청 관리
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-20 bg-white p-12 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-8">주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start">
                <span className="text-2xl mr-4">✓</span>
                <div>
                  <h4 className="font-semibold mb-1">정확한 원가 계산</h4>
                  <p className="text-gray-600">레시피별 원가와 1인분 원가를 자동으로 계산합니다</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">✓</span>
                <div>
                  <h4 className="font-semibold mb-1">공급업체 비교</h4>
                  <p className="text-gray-600">여러 공급업체의 가격을 한눈에 비교하세요</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">✓</span>
                <div>
                  <h4 className="font-semibold mb-1">마진율 관리</h4>
                  <p className="text-gray-600">판매가 대비 마진율을 실시간으로 확인합니다</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">✓</span>
                <div>
                  <h4 className="font-semibold mb-1">레시피 마켓플레이스</h4>
                  <p className="text-gray-600">셰프들의 전문 레시피를 공유하고 활용하세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2025 Food-Cal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
