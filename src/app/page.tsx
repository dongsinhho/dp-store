import { Suspense } from "react"
import Link from "next/link"
import { Smartphone, Wrench, ArrowLeftRight } from "lucide-react"
import { getProducts } from "@/lib/products"
import ProductCard from "@/components/ProductCard"
import HeroSection from "@/components/HeroSection"
import { HeroSkeleton, ProductGridSkeleton } from "@/components/skeletons"

export const revalidate = 60

async function FeaturedProducts() {
  let displayProducts: Awaited<ReturnType<typeof getProducts>>["items"] = []
  try {
    const { items: featuredProducts } = await getProducts({
      page: 1,
      sort: "-created",
    })
    // Show up to 8 featured products
    displayProducts = featuredProducts.slice(0, 8)
  } catch {
    // Pocketbase unavailable - show nothing
    return null
  }

  if (displayProducts.length === 0) return null

  return (
    <section aria-labelledby="featured-products-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 id="featured-products-heading" className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          Sản phẩm nổi bật
        </h2>
        <Link
          href="/san-pham"
          className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium"
        >
          Xem tất cả →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function FeaturedProductsFallback() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="h-7 sm:h-8 bg-neutral-200 rounded w-48 animate-pulse" />
        <div className="h-5 bg-neutral-200 rounded w-24 animate-pulse" />
      </div>
      <ProductGridSkeleton count={8} />
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Suspense */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Featured Products Section with Suspense */}
      <Suspense fallback={<FeaturedProductsFallback />}>
        <FeaturedProducts />
      </Suspense>

      {/* Service Cards Section */}
      <section className="bg-gray-50 py-12 sm:py-16" aria-labelledby="services-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="services-heading" className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            Dịch vụ của chúng tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Buy/Sell Card */}
            <Link
              href="/san-pham"
              className="group block bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-100 text-blue-600 mb-4 sm:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Mua bán iPhone
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                iPhone mới và cũ đa dạng mẫu mã, giá cạnh tranh. Bảo hành chính
                hãng, hỗ trợ trả góp.
              </p>
            </Link>

            {/* Repair Card */}
            <Link
              href="/sua-chua"
              className="group block bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-green-100 text-green-600 mb-4 sm:mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Wrench className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Sửa chữa iPhone
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Dịch vụ sửa chữa chuyên nghiệp, linh kiện chính hãng. Chẩn đoán
                miễn phí, báo giá trước khi sửa.
              </p>
            </Link>

            {/* Trade-in Card */}
            <Link
              href="/thu-cu-doi-moi"
              className="group block bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-purple-100 text-purple-600 mb-4 sm:mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <ArrowLeftRight className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Thu cũ đổi mới
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Đổi iPhone cũ lấy máy mới, định giá cao, quy trình nhanh gọn.
                Tiết kiệm chi phí nâng cấp.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
