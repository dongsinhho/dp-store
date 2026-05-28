import { getAuthenticatedPb } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import ProductForm from "./ProductForm"
import { getProductById, getCategories } from "../actions"

export const metadata = {
  title: "Sản phẩm - DP Store Admin",
}

export default async function AdminProductEditPage({
  params,
}: {
  params: { id: string }
}) {
  const { isAdmin, isAuthenticated } = await getAuthenticatedPb()

  if (!isAuthenticated || !isAdmin) {
    redirect("/admin/login")
  }

  const isNew = params.id === "new"
  let product = null

  if (!isNew) {
    const result = await getProductById(params.id)
    if (!result.success || !result.product) {
      redirect("/admin/san-pham")
    }
    product = result.product
  }

  const categoriesResult = await getCategories()
  const categories = categoriesResult.categories || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNew ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
      </h1>
      <ProductForm
        product={product}
        categories={categories}
        isNew={isNew}
      />
    </div>
  )
}
