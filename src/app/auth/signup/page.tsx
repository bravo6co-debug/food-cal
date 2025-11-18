"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type UserRole = 'OWNER' | 'CHEF' | 'SUPPLIER'

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: '' as UserRole | '',
  })
  const [profileData, setProfileData] = useState<any>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role })
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profileData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Redirect to signin page
      router.push('/auth/signin?registered=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Food-Cal에 오신 것을 환영합니다
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 text-center">
              어떤 역할로 가입하시겠습니까?
            </h3>

            <button
              onClick={() => handleRoleSelect('OWNER')}
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-4xl mb-2">🍽️</div>
              <h4 className="font-semibold text-lg">식당/카페 운영자</h4>
              <p className="text-sm text-gray-600 mt-1">메뉴 원가 계산 및 관리</p>
            </button>

            <button
              onClick={() => handleRoleSelect('CHEF')}
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-4xl mb-2">👨‍🍳</div>
              <h4 className="font-semibold text-lg">셰프</h4>
              <p className="text-sm text-gray-600 mt-1">레시피 등록 및 공유</p>
            </button>

            <button
              onClick={() => handleRoleSelect('SUPPLIER')}
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-4xl mb-2">🚚</div>
              <h4 className="font-semibold text-lg">식재료 공급업체</h4>
              <p className="text-sm text-gray-600 mt-1">상품 등록 및 판매</p>
            </button>

            <div className="text-center pt-4">
              <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-500">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {formData.role === 'OWNER' && (
                <div>
                  <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                    식당/카페 이름
                  </label>
                  <input
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    required
                    value={profileData.restaurantName || ''}
                    onChange={(e) => setProfileData({ ...profileData, restaurantName: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {formData.role === 'CHEF' && (
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                    전문 분야
                  </label>
                  <input
                    id="specialty"
                    name="specialty"
                    type="text"
                    value={profileData.specialty || ''}
                    onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 한식, 양식, 디저트"
                  />
                </div>
              )}

              {formData.role === 'SUPPLIER' && (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    회사명
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={profileData.companyName || ''}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  연락처
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileData.phone || ''}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? '가입 중...' : '가입하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
