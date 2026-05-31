"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Package,
  ShoppingCart,
  Wrench,
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import { pb } from "@/lib/pocketbase"

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Sản phẩm",
    href: "/admin/san-pham",
    icon: Package,
  },
  {
    label: "Đơn hàng",
    href: "/admin/don-hang",
    icon: ShoppingCart,
  },
  {
    label: "Sửa chữa",
    href: "/admin/sua-chua",
    icon: Wrench,
  },
  {
    label: "Thu cũ đổi mới",
    href: "/admin/thu-cu",
    icon: ArrowLeftRight,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    pb.authStore.clear()
    // Clear the auth cookie
    document.cookie = "pb_auth=; path=/; max-age=0; SameSite=Lax"
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-neutral-200 flex flex-col">
      <div className="p-6 border-b border-neutral-200">
        <h2 className="text-xl font-bold text-neutral-900">DP Store</h2>
        <p className="text-sm text-neutral-500 mt-1">Quản trị</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-primary"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
