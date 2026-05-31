"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { getAdminProducts, deleteProduct } from "./actions"

interface ProductItem {
  id: string
  name: string
  price: number
  stock: number
  is_active: boolean
  condition: string
  created: string
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

export default function AdminProductList({ initialPage }: { initialPage: number }) {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function loadProducts() {
    setIsLoading(true)
    setError("")
    const result = await getAdminProducts(page, 20)
    if (result.success) {
      setProducts(result.items)
      setTotalPages(result.totalPages)
    } else {
      setError(result.error || "Không thể tải danh sách sản phẩm.")
    }
    setIsLoading(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) {
      return
    }

    setDeletingId(id)
    const result = await deleteProduct(id)
    if (result.success) {
      await loadProducts()
    } else {
      alert(result.error || "Không thể xóa sản phẩm.")
    }
    setDeletingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Quản lý sản phẩm</h1>
        <Link
          href="/admin/san-pham/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-sm hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-sm mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-neutral-500">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          Chưa có sản phẩm nào.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-md shadow-subtle overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {product.condition === "new" ? "Mới" : "Cũ"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.is_active ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/san-pham/${product.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-primary hover:text-blue-800 hover:bg-blue-50 rounded-sm transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-error hover:text-red-800 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === product.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-sm hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-neutral-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-sm hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
