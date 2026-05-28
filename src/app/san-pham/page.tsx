import { Metadata } from "next"
import { getProducts } from "@/lib/products"
import ProductGrid from "@/components/ProductGrid"
import Pagination from "@/components/Pagination"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Sản phẩm iPhone | DP Store",
  description:
    "Khám phá bộ sưu tập iPhone mới và cũ với giá tốt nhất. Đa dạng mẫu mã, bảo hành uy tín.",
}

interface ProductsPageProps {
  searchParams: {
    page?: string
    category?: string
    condition?: string
    minPrice?: string
    maxPrice?: string
    search?: string
    sort?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams

  const page = Math.max(1, Number(params.page) || 1)
  const category = params.category || undefined
  const condition =
    params.condition === "new" || params.condition === "used"
      ? params.condition
      : undefined
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const search = params.search || undefined
  const sort = params.sort || undefined

  const result = await getProducts({
    page,
    category,
    condition,
    minPrice: minPrice && !isNaN(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice && !isNaN(maxPrice) ? maxPrice : undefined,
    search,
    sort,
  })

  // Build searchParams record for pagination links
  const paginationParams: Record<string, string | undefined> = {
    category: params.category,
    condition: params.condition,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    search: params.search,
    sort: params.sort,
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Sản phẩm iPhone
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {result.totalItems > 0
            ? `Hiển thị ${(result.page - 1) * result.perPage + 1}–${Math.min(
                result.page * result.perPage,
                result.totalItems
              )} trong ${result.totalItems} sản phẩm`
            : "Không có sản phẩm nào"}
        </p>
      </div>

      <ProductGrid products={result.items} />

      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        basePath="/san-pham"
        searchParams={paginationParams}
      />
    </main>
  )
}
