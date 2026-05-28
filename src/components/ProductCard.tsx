import Link from "next/link"
import Image from "next/image"
import { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

/**
 * Format price in Vietnamese format (e.g., 29.990.000₫)
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫"
}

/**
 * Get the Pocketbase file URL for a product image.
 */
function getImageUrl(product: Product, filename: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
  return `${baseUrl}/api/files/products/${product.id}/${filename}`
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]
    ? getImageUrl(product, product.images[0])
    : "/placeholder-product.png"

  const hasDiscount =
    product.original_price && product.original_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.original_price! - product.price) / product.original_price!) *
          100
      )
    : 0

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group block rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}
        {product.condition === "used" && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Đã qua sử dụng
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {product.storage}
          </span>
          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {product.color}
          </span>
          {product.condition === "used" && product.battery_health != null && (
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              Pin {product.battery_health}%
            </span>
          )}
        </div>

        {product.stock <= 3 && product.stock > 0 && (
          <p className="mt-2 text-xs text-orange-600">
            Chỉ còn {product.stock} sản phẩm
          </p>
        )}
        {product.stock === 0 && (
          <p className="mt-2 text-xs text-red-600 font-medium">Hết hàng</p>
        )}
      </div>
    </Link>
  )
}
