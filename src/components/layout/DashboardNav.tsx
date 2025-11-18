"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardNav() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const role = session.user.role

  const ownerLinks = [
    { href: '/dashboard', label: '대시보드', icon: '🏠' },
    { href: '/dashboard/menus', label: '메뉴 관리', icon: '📋' },
    { href: '/dashboard/recipes', label: '레시피 찾기', icon: '🔍' },
    { href: '/dashboard/suppliers', label: '공급업체', icon: '🚚' },
  ]

  const chefLinks = [
    { href: '/dashboard', label: '대시보드', icon: '🏠' },
    { href: '/dashboard/recipes', label: '내 레시피', icon: '📖' },
    { href: '/dashboard/recipes/new', label: '레시피 작성', icon: '✍️' },
  ]

  const supplierLinks = [
    { href: '/dashboard', label: '대시보드', icon: '🏠' },
    { href: '/dashboard/products', label: '상품 관리', icon: '📦' },
    { href: '/dashboard/inquiries', label: '문의 관리', icon: '💬' },
  ]

  const adminLinks = [
    { href: '/dashboard', label: '대시보드', icon: '🏠' },
    { href: '/dashboard/users', label: '사용자 관리', icon: '👥' },
    { href: '/dashboard/ingredients', label: '식재료 관리', icon: '🥬' },
  ]

  const links =
    role === 'OWNER' ? ownerLinks :
    role === 'CHEF' ? chefLinks :
    role === 'SUPPLIER' ? supplierLinks :
    role === 'ADMIN' ? adminLinks :
    []

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                Food-Cal
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === link.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-sm text-gray-700 mr-4">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
