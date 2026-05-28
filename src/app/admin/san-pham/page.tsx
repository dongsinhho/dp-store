import { getAuthenticatedPb } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import AdminProductList from "./AdminProductList"

export const metadata = {
  title: "Quản lý sản phẩm - DP Store Admin",
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const { isAdmin, isAuthenticated } = await getAuthenticatedPb()

  if (!isAuthenticated || !isAdmin) {
    redirect("/admin/login")
  }

  const page = Number(searchParams.page) || 1

  return <AdminProductList initialPage={page} />
}
