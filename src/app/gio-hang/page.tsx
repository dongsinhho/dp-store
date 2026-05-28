"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/hooks/useCart"

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫"
}

export default function CartPage() {
  const { cart, remove, updateQuantity } = useCart()

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Giỏ hàng trống
        </h1>
        <p className="text-gray-500 mb-6">
          Bạn chưa có sản phẩm nào trong giỏ hàng.
        </p>
        <Link
          href="/san-pham"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xem sản phẩm
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
          >
            {/* Product image */}
            <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-gray-900 truncate">
                {item.name}
              </h2>
              <p className="text-sm text-gray-500">
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
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Giảm số lượng"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                aria-label="Tăng số lượng"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right min-w-[120px]">
              <p className="font-semibold text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>

            {/* Remove button */}
            <button
              onClick={() => remove(item.productId)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Cart summary */}
      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg text-gray-700">
            Tổng cộng ({cart.totalItems} sản phẩm):
          </span>
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(cart.totalAmount)}
          </span>
        </div>

        <Link
          href="/dat-hang"
          className="block w-full text-center bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Tiến hành đặt hàng
        </Link>
      </div>
    </div>
  )
}
