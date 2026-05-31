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
 * Calculate discount percentage from original and current price.
 */
export function calculateDiscountPercent(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice <= 0 || currentPrice <= 0 || originalPrice <= currentPrice) {
    return 0
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
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
    product.original_price != null && product.original_price > product.price
  const discountPercent = hasDiscount
    ? calculateDiscountPercent(product.original_price!, product.price)
    : 0

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group relative block rounded-[8px] bg-white overflow-hidden shadow-subtle hover:shadow-elevated transition-shadow duration-200 will-change-[box-shadow]"
    >
      {/* Image Container - Square aspect ratio */}
      <div className="relative aspect-square overflow-hidden rounded-t-[8px] bg-neutral-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 will-change-transform"
        />

        {/* Discount Badge - Top Left */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-error text-white text-xs font-semibold px-2 py-1 rounded-sm z-10">
            -{discountPercent}%
          </span>
        )}

        {/* Hover Overlay with "Xem chi tiết" button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <span className="px-4 py-2 bg-white text-neutral-800 text-sm font-medium rounded-md shadow-medium hover:bg-neutral-50 transition-colors">
            Xem chi tiết
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Product Name - Max 2 lines */}
        <h3 className="text-sm sm:text-base font-medium text-neutral-900 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-neutral-400 line-through">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>

        {/* Attribute Tags - Storage, Color, Battery Health */}
        <div className="mt-2 flex flex-wrap gap-1">
          {product.storage && (
            <span className="inline-block text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-sm">
              {product.storage}
            </span>
          )}
          {product.color && (
            <span className="inline-block text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-sm">
              {product.color}
            </span>
          )}
          {product.condition === "used" && product.battery_health != null && (
            <span className="inline-block text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-sm">
              🔋 Pin {product.battery_health}%
            </span>
          )}
        </div>

        {/* Stock Warning */}
        {product.stock > 0 && product.stock <= 3 && (
          <p className="mt-2 text-xs text-orange-500 font-medium">
            Chỉ còn {product.stock} sản phẩm
          </p>
        )}
        {product.stock === 0 && (
          <p className="mt-2 text-xs font-semibold text-error">
            Hết hàng
          </p>
        )}
      </div>
    </Link>
  )
}
