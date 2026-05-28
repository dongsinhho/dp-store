"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, CheckCircle, AlertCircle, AlertTriangle, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { orderFormSchema } from "@/lib/validations"
import { createOrder, StockConflict } from "./actions"

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫"
}

interface FormErrors {
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  customer_address?: string
  payment_method?: string
  general?: string
}

export default function CheckoutPage() {
  const { cart, clear, updateQuantity, remove } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string>("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [stockConflicts, setStockConflicts] = useState<StockConflict[]>([])

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    payment_method: "" as "cod" | "bank_transfer" | "",
    notes: "",
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function handleConflictUpdateQuantity(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      remove(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
    // Remove the resolved conflict from the list
    setStockConflicts((prev) => prev.filter((c) => c.productId !== productId))
  }

  function handleConflictRemoveItem(productId: string) {
    remove(productId)
    // Remove the resolved conflict from the list
    setStockConflicts((prev) => prev.filter((c) => c.productId !== productId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Clear previous errors and stock conflicts
    setErrors({})
    setStockConflicts([])

    // Client-side validation with Zod
    const validation = orderFormSchema.safeParse({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_address: formData.customer_address,
      payment_method: formData.payment_method || undefined,
    })

    if (!validation.success) {
      const fieldErrors: FormErrors = {}
      for (const err of validation.error.issues) {
        const field = err.path[0] as keyof FormErrors
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    // Validate cart is not empty
    if (cart.items.length === 0) {
      setErrors({ general: "Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng." })
      return
    }

    // Disable button to prevent duplicates
    setIsSubmitting(true)

    try {
      const result = await createOrder({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || undefined,
        customer_address: formData.customer_address,
        payment_method: formData.payment_method as "cod" | "bank_transfer",
        notes: formData.notes || undefined,
        items: cart.items,
      })

      if (result.success) {
        setOrderId(result.orderId || "")
        setOrderSuccess(true)
        clear()
      } else if (result.stockConflicts && result.stockConflicts.length > 0) {
        // Stock conflict - show specific UI for resolution
        setStockConflicts(result.stockConflicts)
        setIsSubmitting(false)
      } else {
        setErrors({ general: result.error || "Đã xảy ra lỗi. Vui lòng thử lại." })
        setIsSubmitting(false)
      }
    } catch {
      setErrors({ general: "Đã xảy ra lỗi kết nối. Vui lòng thử lại." })
      setIsSubmitting(false)
    }
  }

  // Show confirmation page on success
  if (orderSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600 mb-2">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            Mã đơn hàng: <span className="font-mono font-medium">{orderId}</span>
          </p>
        )}
        <div className="flex gap-4">
          <Link
            href="/san-pham"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  // Show empty cart state
  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Giỏ hàng trống
        </h1>
        <p className="text-gray-500 mb-6">
          Bạn cần thêm sản phẩm vào giỏ hàng trước khi đặt hàng.
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
      <h1 className="text-2xl font-bold mb-6">Đặt hàng</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General error */}
            {errors.general && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Stock conflict resolution UI */}
            {stockConflicts.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg" role="alert" aria-live="assertive">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800">Một số sản phẩm không đủ hàng</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Vui lòng cập nhật số lượng hoặc xóa sản phẩm để tiếp tục đặt hàng.
                    </p>
                  </div>
                </div>
                <div className="space-y-3 mt-3">
                  {stockConflicts.map((conflict) => (
                    <div
                      key={conflict.productId}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-white border border-amber-100 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{conflict.productName}</p>
                        <p className="text-sm text-amber-700">
                          Yêu cầu: {conflict.requestedQuantity} — Còn lại: {conflict.availableStock}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {conflict.availableStock > 0 && (
                          <button
                            type="button"
                            onClick={() => handleConflictUpdateQuantity(conflict.productId, conflict.availableStock)}
                            className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                          >
                            Đặt {conflict.availableStock}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleConflictRemoveItem(conflict.productId)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {stockConflicts.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    <Link
                      href="/gio-hang"
                      className="text-sm text-amber-700 underline hover:text-amber-900"
                    >
                      Quay lại giỏ hàng để chỉnh sửa
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Customer name */}
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nguyễn Văn A"
              />
              {errors.customer_name && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
              )}
            </div>

            {/* Customer phone */}
            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0912345678"
              />
              {errors.customer_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_phone}</p>
              )}
            </div>

            {/* Customer email */}
            <div>
              <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (không bắt buộc)
              </label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>

            {/* Customer address */}
            <div>
              <label htmlFor="customer_address" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ giao hàng <span className="text-red-500">*</span>
              </label>
              <textarea
                id="customer_address"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              />
              {errors.customer_address && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_address}</p>
              )}
            </div>

            {/* Payment method */}
            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.payment_method ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">-- Chọn phương thức --</option>
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              </select>
              {errors.payment_method && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú (không bắt buộc)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú thêm cho đơn hàng..."
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </form>
        </div>

        {/* Order summary sidebar */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h2 className="font-semibold text-lg mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-medium">Tổng cộng:</span>
                <span className="font-bold text-blue-600">
                  {formatPrice(cart.totalAmount)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ({cart.totalItems} sản phẩm)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
