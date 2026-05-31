"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/hooks/useCart"

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫"
}

export default function CartPage() {
  const { cart, remove, updateQuantity } = useCart()

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 mb-6">
          <ShoppingBag className="w-16 h-16 text-[var(--color-primary)] opacity-60" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-neutral-800)] mb-2">
          Giỏ hàng trống
        </h1>
        <p className="text-[var(--color-neutral-500)] mb-8 text-center max-w-sm">
          Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm
          của chúng tôi!
        </p>
        <Link
          href="/san-pham"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-8 py-3 rounded-[var(--radius-md)] font-semibold hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-medium"
        >
          <ShoppingCart className="w-5 h-5" aria-hidden="true" />
          Xem sản phẩm
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-neutral-900)] mb-8 leading-[var(--leading-h2)]">
        Giỏ hàng của bạn
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items list */}
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 p-4 bg-white rounded-[var(--radius-md)] shadow-subtle hover:shadow-medium transition-shadow duration-300 border border-[var(--color-neutral-100)]"
            >
              {/* Product image */}
              <div className="relative w-20 h-20 min-w-[80px] min-h-[80px] flex-shrink-0 bg-[var(--color-neutral-50)] rounded-[var(--radius-sm)] overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-neutral-300)]">
                    <ShoppingCart className="w-8 h-8" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-[var(--color-neutral-900)] truncate text-[var(--text-body)]">
                  {item.name}
                </h2>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                  {formatPrice(item.price)}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-white hover:bg-[var(--color-neutral-50)] hover:border-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-neutral-200)] disabled:hover:bg-white transition-all duration-300"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="w-4 h-4 text-[var(--color-neutral-600)]" aria-hidden="true" />
                </button>
                <span className="w-10 text-center font-semibold text-[var(--color-neutral-800)] text-base" aria-live="polite" aria-atomic="true">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-white hover:bg-[var(--color-neutral-50)] hover:border-[var(--color-primary)] transition-all duration-300"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="w-4 h-4 text-[var(--color-neutral-600)]" aria-hidden="true" />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right min-w-[120px] hidden sm:block">
                <p className="font-bold text-[var(--color-neutral-900)]">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => remove(item.productId)}
                className="p-2 text-[var(--color-error)] hover:bg-red-50 rounded-full transition-all duration-200"
                aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
              >
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        {/* Cart summary - sticky on desktop */}
        <div className="lg:w-80">
          <div className="lg:sticky lg:top-24 bg-white rounded-[var(--radius-lg)] shadow-medium border border-[var(--color-neutral-100)] p-6">
            <h2 className="text-[var(--text-h4)] font-bold text-[var(--color-neutral-900)] mb-4 leading-[var(--leading-h4)]">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-[var(--color-neutral-600)]">
                <span>Số lượng sản phẩm</span>
                <span className="font-semibold text-[1.25rem] text-[var(--color-neutral-900)]">
                  {cart.totalItems}
                </span>
              </div>
              <div className="border-t border-[var(--color-neutral-100)] pt-3 flex items-center justify-between">
                <span className="text-[var(--color-neutral-700)] font-medium">
                  Tổng cộng
                </span>
                <span className="text-[1.5rem] font-bold text-[var(--color-primary)]">
                  {formatPrice(cart.totalAmount)}
                </span>
              </div>
            </div>

            <Link
              href="/dat-hang"
              className="block w-full text-center bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-3.5 px-6 rounded-[var(--radius-md)] font-semibold hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-subtle hover:shadow-medium"
            >
              Tiến hành đặt hàng
            </Link>

            <Link
              href="/san-pham"
              className="block w-full text-center text-[var(--color-primary)] py-3 mt-3 rounded-[var(--radius-md)] font-medium hover:bg-[var(--color-neutral-50)] transition-colors duration-200"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
