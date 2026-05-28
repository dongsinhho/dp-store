import Link from "next/link"
import { Smartphone, Wrench, ArrowLeftRight } from "lucide-react"
import { getProducts } from "@/lib/products"
import ProductCard from "@/components/ProductCard"

export const revalidate = 60

export default async function HomePage() {
  let displayProducts: Awaited<ReturnType<typeof getProducts>>["items"] = []
  try {
    const { items: featuredProducts } = await getProducts({
      page: 1,
      sort: "-created",
    })
    // Show up to 8 featured products
    displayProducts = featuredProducts.slice(0, 8)
  } catch {
    // Pocketbase unavailable - show page without featured products
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              iPhone chính hãng, giá tốt nhất
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
              Mua bán iPhone mới và cũ, dịch vụ sửa chữa uy tín, thu cũ đổi mới
              với giá hấp dẫn. Cam kết chất lượng, bảo hành đầy đủ.
            </p>
            <Link
              href="/san-pham"
              className="mt-6 sm:mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base sm:text-lg transition-colors"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {displayProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
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
      )}

      {/* Service Cards Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            Dịch vụ của chúng tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Buy/Sell Card */}
            <Link
              href="/san-pham"
              className="group block bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-100 text-blue-600 mb-4 sm:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
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
                <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />
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
                <ArrowLeftRight className="w-6 h-6 sm:w-7 sm:h-7" />
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
    </main>
  )
}
