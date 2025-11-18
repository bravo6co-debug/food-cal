import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardNav from "@/components/layout/DashboardNav"
import SessionProvider from "@/components/providers/SessionProvider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
