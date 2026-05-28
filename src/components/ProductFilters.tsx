"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Search } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories?: Category[]
}

export default function ProductFilters({ categories = [] }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") ?? ""
  const currentCondition = searchParams.get("condition") ?? ""
  const currentMinPrice = searchParams.get("minPrice") ?? ""
  const currentMaxPrice = searchParams.get("maxPrice") ?? ""
  const currentSearch = searchParams.get("search") ?? ""

  const [search, setSearch] = useState(currentSearch)
  const [minPrice, setMinPrice] = useState(currentMinPrice)
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice)
  const [priceError, setPriceError] = useState("")

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset to page 1 when filters change
      params.delete("page")

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }

      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ category: e.target.value })
  }

  const handleConditionChange = (condition: string) => {
    updateFilters({ condition })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search })
  }

  const handlePriceApply = () => {
    const min = minPrice ? Number(minPrice) : 0
    const max = maxPrice ? Number(maxPrice) : 0

    if (minPrice && maxPrice && min > max) {
      setPriceError("Giá tối thiểu không được lớn hơn giá tối đa")
      return
    }

    setPriceError("")
    updateFilters({ minPrice, maxPrice })
  }

  const handleClearFilters = () => {
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    setPriceError("")
    router.push("?")
  }

  const hasActiveFilters =
    currentCategory || currentCondition || currentMinPrice || currentMaxPrice || currentSearch

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit}>
        <label htmlFor="search-input" className="mb-1 block text-sm font-medium text-gray-700">
          Tìm kiếm
        </label>
        <div className="relative">
          <input
            id="search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
            aria-label="Tìm kiếm"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Category Dropdown */}
      <div>
        <label htmlFor="category-select" className="mb-1 block text-sm font-medium text-gray-700">
          Danh mục
        </label>
        <select
          id="category-select"
          value={currentCategory}
          onChange={handleCategoryChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Toggle */}
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Tình trạng</span>
        <div className="flex gap-1 rounded-md border border-gray-300 p-1">
          <button
            type="button"
            onClick={() => handleConditionChange("")}
            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              currentCondition === ""
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => handleConditionChange("new")}
            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              currentCondition === "new"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Mới
          </button>
          <button
            type="button"
            onClick={() => handleConditionChange("used")}
            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              currentCondition === "used"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cũ
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Khoảng giá (VND)</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value)
              setPriceError("")
            }}
            placeholder="Từ"
            min="0"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Giá tối thiểu"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value)
              setPriceError("")
            }}
            placeholder="Đến"
            min="0"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Giá tối đa"
          />
        </div>
        {priceError && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {priceError}
          </p>
        )}
        <button
          type="button"
          onClick={handlePriceApply}
          className="mt-2 w-full rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Áp dụng giá
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  )
}
