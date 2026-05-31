"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react"

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
  const currentSort = searchParams.get("sort") ?? ""

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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sort: e.target.value })
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

  const handleRemoveFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete("page")

    if (key === "minPrice" || key === "maxPrice") {
      params.delete("minPrice")
      params.delete("maxPrice")
      setMinPrice("")
      setMaxPrice("")
    }
    if (key === "search") {
      setSearch("")
    }

    router.push(`?${params.toString()}`)
  }

  const hasActiveFilters =
    currentCategory || currentCondition || currentMinPrice || currentMaxPrice || currentSearch

  // Build active filter chips
  const activeChips: { key: string; label: string }[] = []
  if (currentSearch) {
    activeChips.push({ key: "search", label: `"${currentSearch}"` })
  }
  if (currentCategory) {
    const cat = categories.find((c) => c.id === currentCategory)
    activeChips.push({ key: "category", label: cat?.name ?? "Danh mục" })
  }
  if (currentCondition) {
    activeChips.push({
      key: "condition",
      label: currentCondition === "new" ? "Mới" : "Cũ",
    })
  }
  if (currentMinPrice || currentMaxPrice) {
    const min = currentMinPrice ? `${Number(currentMinPrice).toLocaleString("vi-VN")}đ` : "0đ"
    const max = currentMaxPrice ? `${Number(currentMaxPrice).toLocaleString("vi-VN")}đ` : "∞"
    activeChips.push({ key: "minPrice", label: `${min} - ${max}` })
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls Row */}
      <div className="rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] bg-white p-4 shadow-[var(--shadow-subtle)]">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--color-neutral-500)]" />
          <span className="text-sm font-semibold text-[var(--color-neutral-700)]">Bộ lọc</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <label htmlFor="search-input" className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
            Tìm kiếm
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-neutral-300)] bg-white py-2.5 pl-3 pr-10 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--color-neutral-400)] hover:text-[var(--color-primary)] transition-colors duration-200"
              aria-label="Tìm kiếm"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Category Dropdown */}
          <div>
            <label htmlFor="category-select" className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
              Danh mục
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={currentCategory}
                onChange={handleCategoryChange}
                className="w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--color-neutral-300)] bg-white px-3 py-2.5 pr-9 text-sm text-[var(--color-neutral-800)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div>
            <label htmlFor="sort-select" className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
              Sắp xếp
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={currentSort}
                onChange={handleSortChange}
                className="w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--color-neutral-300)] bg-white px-3 py-2.5 pr-9 text-sm text-[var(--color-neutral-800)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
              >
                <option value="">Mới nhất</option>
                <option value="price">Giá tăng dần</option>
                <option value="-price">Giá giảm dần</option>
                <option value="name">Tên A-Z</option>
                <option value="-name">Tên Z-A</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
            </div>
          </div>

          {/* Condition Dropdown (styled as segmented control) */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">Tình trạng</span>
            <div className="flex gap-1 rounded-[var(--radius-sm)] border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] p-1">
              <button
                type="button"
                onClick={() => handleConditionChange("")}
                className={`flex-1 rounded-[4px] px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  currentCondition === ""
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-neutral-600)] hover:bg-white hover:shadow-sm"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => handleConditionChange("new")}
                className={`flex-1 rounded-[4px] px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  currentCondition === "new"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-neutral-600)] hover:bg-white hover:shadow-sm"
                }`}
              >
                Mới
              </button>
              <button
                type="button"
                onClick={() => handleConditionChange("used")}
                className={`flex-1 rounded-[4px] px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  currentCondition === "used"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-neutral-600)] hover:bg-white hover:shadow-sm"
                }`}
              >
                Cũ
              </button>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="mt-4">
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">Khoảng giá (VND)</span>
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
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-neutral-300)] bg-white px-3 py-2.5 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
              aria-label="Giá tối thiểu"
            />
            <span className="text-[var(--color-neutral-400)] text-sm">—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value)
                setPriceError("")
              }}
              placeholder="Đến"
              min="0"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-neutral-300)] bg-white px-3 py-2.5 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
              aria-label="Giá tối đa"
            />
          </div>
          {priceError && (
            <p className="mt-1.5 text-sm text-[var(--color-error)]" role="alert">
              {priceError}
            </p>
          )}
          <button
            type="button"
            onClick={handlePriceApply}
            className="mt-2.5 w-full rounded-[var(--radius-sm)] bg-[var(--color-neutral-100)] px-3 py-2 text-sm font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)] transition-colors duration-200"
          >
            Áp dụng giá
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-[var(--color-primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)]"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => handleRemoveFilter(chip.key)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-[var(--color-primary)]/20 transition-colors duration-150"
                aria-label={`Xóa bộ lọc ${chip.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--color-neutral-300)] px-3 py-1.5 text-sm font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] transition-colors duration-200"
          >
            <X className="h-3.5 w-3.5" />
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  )
}
