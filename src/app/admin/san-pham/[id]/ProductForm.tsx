"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { createProduct, updateProduct } from "../actions"
import { generateSlug } from "@/lib/product-validation"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  product: Record<string, unknown> | null
  categories: Category[]
  isNew: boolean
}

export default function ProductForm({ product, categories, isNew }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Form state
  const [name, setName] = useState((product?.name as string) || "")
  const [category, setCategory] = useState((product?.category as string) || "")
  const [condition, setCondition] = useState<"new" | "used">(
    (product?.condition as "new" | "used") || "new"
  )
  const [price, setPrice] = useState(product?.price ? String(product.price) : "")
  const [originalPrice, setOriginalPrice] = useState(
    product?.original_price ? String(product.original_price) : ""
  )
  const [storage, setStorage] = useState((product?.storage as string) || "")
  const [color, setColor] = useState((product?.color as string) || "")
  const [batteryHealth, setBatteryHealth] = useState(
    product?.battery_health !== undefined && product?.battery_health !== null
      ? String(product.battery_health)
      : ""
  )
  const [description, setDescription] = useState((product?.description as string) || "")
  const [stock, setStock] = useState(product?.stock !== undefined ? String(product.stock) : "0")
  const [isActive, setIsActive] = useState(
    product?.is_active !== undefined ? (product.is_active as boolean) : true
  )

  // Computed slug preview
  const slugPreview = generateSlug(name)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)

    // Ensure is_active is set correctly
    formData.set("is_active", String(isActive))

    let result
    if (isNew) {
      result = await createProduct(formData)
    } else {
      result = await updateProduct(product?.id as string, formData)
    }

    if (result.success) {
      router.push("/admin/san-pham")
      router.refresh()
    } else {
      setError(result.error || "Đã xảy ra lỗi.")
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/san-pham"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="iPhone 15 Pro Max 256GB"
          />
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
          )}
          {name && (
            <p className="mt-1 text-sm text-gray-500">
              Slug: <code className="bg-gray-100 px-1 rounded">{slugPreview}</code>
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục <span className="text-red-500">*</span>
          </label>
          {categories.length > 0 ? (
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="category"
              name="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ID danh mục"
            />
          )}
          {fieldErrors.category && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
          )}
        </div>

        {/* Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            Tình trạng <span className="text-red-500">*</span>
          </label>
          <select
            id="condition"
            name="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as "new" | "used")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="new">Mới</option>
            <option value="used">Cũ</option>
          </select>
        </div>

        {/* Price and Original Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (VND) <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={1}
              max={999999999}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="25000000"
            />
            {fieldErrors.price && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
            )}
          </div>
          <div>
            <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-1">
              Giá gốc (VND)
            </label>
            <input
              id="original_price"
              name="original_price"
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              min={1}
              max={999999999}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30000000"
            />
          </div>
        </div>

        {/* Storage and Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="storage" className="block text-sm font-medium text-gray-700 mb-1">
              Dung lượng <span className="text-red-500">*</span>
            </label>
            <select
              id="storage"
              name="storage"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn dung lượng</option>
              <option value="64GB">64GB</option>
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB</option>
            </select>
            {fieldErrors.storage && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.storage}</p>
            )}
          </div>
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Màu sắc <span className="text-red-500">*</span>
            </label>
            <input
              id="color"
              name="color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Đen Titan"
            />
            {fieldErrors.color && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.color}</p>
            )}
          </div>
        </div>

        {/* Battery Health (only for used) */}
        {condition === "used" && (
          <div>
            <label htmlFor="battery_health" className="block text-sm font-medium text-gray-700 mb-1">
              Sức khỏe pin (%) <span className="text-red-500">*</span>
            </label>
            <input
              id="battery_health"
              name="battery_health"
              type="number"
              value={batteryHealth}
              onChange={(e) => setBatteryHealth(e.target.value)}
              required
              min={0}
              max={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="85"
            />
            {fieldErrors.battery_health && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.battery_health}</p>
            )}
          </div>
        )}

        {/* Stock */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            Tồn kho <span className="text-red-500">*</span>
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min={0}
            max={9999}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10"
          />
          {fieldErrors.stock && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.stock}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả chi tiết sản phẩm..."
          />
          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh <span className="text-red-500">*</span>
            <span className="text-gray-500 font-normal"> (1-10 ảnh)</span>
          </label>

          {!isNew && product?.images && Array.isArray(product.images) && (product.images as string[]).length > 0 ? (
            <div className="mb-2">
              <p className="text-sm text-gray-500 mb-1">
                Ảnh hiện tại: {(product.images as string[]).length} ảnh
              </p>
              <div className="flex flex-wrap gap-2">
                {(product.images as string[]).map((img, idx) => (
                  <div key={idx} className="relative">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                      {img}
                    </span>
                    <input type="hidden" name="existing_images" value={img} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <input
            id="images"
            name="images"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Chấp nhận JPG, PNG. {isNew ? "Tối thiểu 1 ảnh." : "Thêm ảnh mới (nếu cần)."}
          </p>
          {fieldErrors.images && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.images}</p>
          )}
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-3">
          <input
            id="is_active"
            name="is_active_checkbox"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Đang bán (hiển thị trên trang web)
          </label>
        </div>
        {/* Hidden field to send is_active value */}
        <input type="hidden" name="is_active" value={String(isActive)} />

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSubmitting
              ? "Đang lưu..."
              : isNew
              ? "Tạo sản phẩm"
              : "Cập nhật sản phẩm"}
          </button>
          <Link
            href="/admin/san-pham"
            className="px-6 py-2 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
