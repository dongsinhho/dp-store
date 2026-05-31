import { cookies } from "next/headers"
import AdminSidebar from "./AdminSidebar"

export const metadata = {
  title: "Quản trị - DP Store",
  description: "Trang quản trị DP Store",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const authCookie = cookieStore.get("pb_auth")

  // Check if user is authenticated admin
  let isAdmin = false
  if (authCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie.value))
      isAdmin = !!parsed.token && parsed.model?.role === "admin"
    } catch {
      // Invalid cookie
    }
  }

  // If not authenticated admin, render children without sidebar (login page)
  if (!isAdmin) {
    return <>{children}</>
  }

  // Authenticated admin gets the full dashboard layout
  return (
    <div className="min-h-screen flex bg-neutral-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
