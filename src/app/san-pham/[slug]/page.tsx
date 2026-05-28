import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getProductBySlug } from "@/lib/products"
import { formatPrice } from "@/components/ProductCard"
import AddToCartButton from "@/components/AddToCartButton"
import { Product } from "@/lib/types"

export const revalidate = 60

interface ProductDetailPageProps {
  params: { slug: string }
}

/**
 * Get the Pocketbase file URL for a product image.
 */
function getImageUrl(product: Product, filename: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
  return `${baseUrl}/api/files/products/${product.id}/${filename}`
}

/**
 * Generate dynamic metadata for SEO (meta title, description, Open Graph, canonical).
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại | DP Store",
    }
  }

  // Meta title: max 60 chars
  const title = product.name.length > 53
    ? product.name.slice(0, 53) + "… | DP"
    : `${product.name} | DP Store`
  const metaTitle = title.length > 60 ? title.slice(0, 57) + "..." : title

  // Meta description: max 160 chars from product description
  const rawDescription = product.description || `Mua ${product.name} giá tốt tại DP Store`
  const metaDescription =
    rawDescription.length > 160
      ? rawDescription.slice(0, 157) + "..."
      : rawDescription

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const canonicalUrl = `${baseUrl}/san-pham/${product.slug}`
  const imageUrl = product.images?.[0]
    ? getImageUrl(product, product.images[0])
    : undefined

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const hasDiscount =
    product.original_price && product.original_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.original_price! - product.price) / product.original_price!) *
          100
      )
    : 0

  const mainImage = product.images?.[0]
    ? getImageUrl(product, product.images[0])
    : "/placeholder-product.png"

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb / Back link */}
      <Link
        href="/san-pham"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách sản phẩm
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded">
                -{discountPercent}%
              </span>
            )}
            {product.condition === "used" && (
              <span className="absolute top-3 right-3 bg-yellow-500 text-white text-sm font-semibold px-3 py-1 rounded">
                Đã qua sử dụng
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-md bg-gray-100 border border-gray-200 hover:border-blue-400 transition-colors"
                >
                  <Image
                    src={getImageUrl(product, img)}
                    alt={`${product.name} - Ảnh ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 25vw, 10vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-red-600">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.original_price!)}
              </span>
            )}
          </div>

          {/* Product attributes */}
          <div className="space-y-3 border-t border-b border-gray-200 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tình trạng</span>
              <span className="text-sm font-medium text-gray-900">
                {product.condition === "new" ? "Mới" : "Đã qua sử dụng"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dung lượng</span>
              <span className="text-sm font-medium text-gray-900">
                {product.storage}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Màu sắc</span>
              <span className="text-sm font-medium text-gray-900">
                {product.color}
              </span>
            </div>
            {product.condition === "used" &&
              product.battery_health != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sức khỏe pin</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.battery_health}%
                  </span>
                </div>
              )}
          </div>

          {/* Add to Cart */}
          <AddToCartButton product={product} />

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Mô tả sản phẩm
              </h2>
              <div className="prose prose-sm text-gray-700 whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
