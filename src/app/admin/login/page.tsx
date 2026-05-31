"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { pb } from "@/lib/pocketbase"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await pb.collection("users").authWithPassword(email, password)

      // Check if user has admin role
      const user = pb.authStore.model
      if (!user || user.role !== "admin") {
        pb.authStore.clear()
        setError("Bạn không có quyền truy cập trang quản trị.")
        setIsLoading(false)
        return
      }

      // Store auth in cookie for server-side access
      document.cookie = `pb_auth=${encodeURIComponent(
        JSON.stringify({
          token: pb.authStore.token,
          model: pb.authStore.model,
        })
      )}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

      router.push("/admin")
      router.refresh()
    } catch {
      setError("Email hoặc mật khẩu không đúng.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-full max-w-md bg-white rounded-md shadow-medium p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Quản trị viên</h1>
          <p className="text-neutral-600 mt-2">Đăng nhập để truy cập trang quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-neutral-300 rounded-sm shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-neutral-300 rounded-sm shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  )
}
