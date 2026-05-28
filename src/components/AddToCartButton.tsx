"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart, Check } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { Product } from "@/lib/types"

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const isOutOfStock = product.stock === 0

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1))
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return
    add(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Số lượng:</span>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
            aria-label="Giảm số lượng"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium text-gray-900">
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={quantity >= product.stock || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
            aria-label="Tăng số lượng"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <span className="text-sm text-orange-600">
            Còn {product.stock} sản phẩm
          </span>
        )}
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          isOutOfStock
            ? "bg-gray-400 cursor-not-allowed"
            : added
              ? "bg-green-600"
              : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-label={isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
      >
        {isOutOfStock ? (
          "Hết hàng"
        ) : added ? (
          <>
            <Check className="w-5 h-5" />
            Đã thêm vào giỏ hàng
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Thêm vào giỏ hàng
          </>
        )}
      </button>
    </div>
  )
}
