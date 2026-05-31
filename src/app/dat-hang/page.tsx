"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, AlertCircle, AlertTriangle, Trash2, ChevronDown } from "lucide-react"
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

/** Animated checkmark SVG for success confirmation */
function AnimatedCheckmark() {
  return (
    <div className="animate-scale-in">
      <svg
        className="w-20 h-20"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="var(--color-success)"
          strokeWidth="4"
          strokeDasharray="283"
          strokeDashoffset="0"
          className="animate-[checkmark-circle_500ms_ease-out_forwards]"
          fill="none"
        />
        <path
          d="M30 52 L44 66 L70 38"
          stroke="var(--color-success)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          strokeDashoffset="0"
          className="animate-[checkmark-draw_400ms_ease-out_200ms_forwards]"
          fill="none"
        />
      </svg>
    </div>
  )
}

/** Inline error message with slide-down animation */
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-sm text-[var(--color-error)] animate-slide-down overflow-hidden">
      {message}
    </p>
  )
}

export default function CheckoutPage() {
  const { cart, clear, updateQuantity, remove } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string>("")
  const [orderTotal, setOrderTotal] = useState<number>(0)
  const [errors, setErrors] = useState<FormErrors>({})
  const [stockConflicts, setStockConflicts] = useState<StockConflict[]>([])
  const [summaryExpanded, setSummaryExpanded] = useState(true)

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
        setOrderTotal(cart.totalAmount)
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
        <AnimatedCheckmark />
        <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-2 animate-fade-in">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600 mb-2 animate-fade-in">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-2 animate-fade-in">
            Mã đơn hàng: <span className="font-mono font-medium text-[var(--color-primary)]">{orderId}</span>
          </p>
        )}
        {orderTotal > 0 && (
          <p className="text-lg font-semibold text-gray-800 mb-6 animate-fade-in">
            Tổng thanh toán: <span className="text-[var(--color-primary)]">{formatPrice(orderTotal)}</span>
          </p>
        )}
        <div className="flex gap-4 animate-fade-in">
          <Link
            href="/san-pham"
            className="bg-gradient-to-r from-[var(--color-primary)] to-blue-700 text-white px-6 py-3 rounded-[var(--radius-md)] hover:opacity-90 transition-all duration-200 font-medium shadow-medium"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-[var(--radius-md)] hover:bg-gray-50 transition-all duration-200 font-medium"
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
          className="bg-gradient-to-r from-[var(--color-primary)] to-blue-700 text-white px-6 py-3 rounded-[var(--radius-md)] hover:opacity-90 transition-all duration-200 font-medium shadow-medium"
        >
          Xem sản phẩm
        </Link>
      </div>
    )
  }

  // Input field base classes
  const inputBaseClass =
    "w-full px-4 py-3 border rounded-[var(--radius-md)] bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
  const inputErrorClass = "border-[var(--color-error)] focus:ring-[var(--color-error)] focus:border-[var(--color-error)]"
  const inputNormalClass = "border-gray-300"

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">Đặt hàng</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        {/* Order form - takes 3 columns on desktop */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General error */}
            {errors.general && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-[var(--radius-md)] animate-slide-down">
                <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Stock conflict resolution UI */}
            {stockConflicts.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-[var(--radius-md)]" role="alert" aria-live="assertive">
                <div className="flex items-start gap-3 mb-3">
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
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-white border border-amber-100 rounded-[var(--radius-sm)]"
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
                            className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-[var(--radius-sm)] hover:bg-amber-700 transition-colors"
                          >
                            Đặt {conflict.availableStock}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleConflictRemoveItem(conflict.productId)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-[var(--radius-sm)] hover:bg-red-50 transition-colors"
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
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={`${inputBaseClass} ${
                  errors.customer_name ? inputErrorClass : inputNormalClass
                }`}
                placeholder="Nguyễn Văn A"
              />
              <FieldError message={errors.customer_name} />
            </div>

            {/* Customer phone */}
            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                className={`${inputBaseClass} ${
                  errors.customer_phone ? inputErrorClass : inputNormalClass
                }`}
                placeholder="0912345678"
              />
              <FieldError message={errors.customer_phone} />
            </div>

            {/* Customer email */}
            <div>
              <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-gray-400 font-normal">(không bắt buộc)</span>
              </label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className={`${inputBaseClass} ${inputNormalClass}`}
                placeholder="email@example.com"
              />
            </div>

            {/* Customer address */}
            <div>
              <label htmlFor="customer_address" className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ giao hàng <span className="text-[var(--color-error)]">*</span>
              </label>
              <textarea
                id="customer_address"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                rows={3}
                className={`${inputBaseClass} resize-none ${
                  errors.customer_address ? inputErrorClass : inputNormalClass
                }`}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              />
              <FieldError message={errors.customer_address} />
            </div>

            {/* Payment method */}
            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán <span className="text-[var(--color-error)]">*</span>
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className={`${inputBaseClass} ${
                  errors.payment_method ? inputErrorClass : inputNormalClass
                }`}
              >
                <option value="">-- Chọn phương thức --</option>
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              </select>
              <FieldError message={errors.payment_method} />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú <span className="text-gray-400 font-normal">(không bắt buộc)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className={`${inputBaseClass} ${inputNormalClass} resize-none`}
                placeholder="Ghi chú thêm cho đơn hàng..."
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-700 text-white py-3.5 px-6 rounded-[var(--radius-md)] font-semibold hover:opacity-90 hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </form>
        </div>

        {/* Order summary - sidebar on desktop, collapsible on mobile */}
        <div className="md:col-span-2">
          {/* Desktop: always visible sidebar */}
          <div className="hidden md:block sticky top-24">
            <div className="bg-gray-50 rounded-[var(--radius-lg)] p-6 shadow-subtle border border-gray-100">
              <h2 className="font-semibold text-lg mb-5 text-gray-900">Đơn hàng của bạn</h2>
              <div className="space-y-3 mb-5">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start text-sm gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-700 block truncate">{item.name}</span>
                      <span className="text-gray-400 text-xs">x{item.quantity}</span>
                    </div>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Tổng cộng:</span>
                  <span className="font-bold text-lg text-[var(--color-primary)]">
                    {formatPrice(cart.totalAmount)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ({cart.totalItems} sản phẩm)
                </p>
              </div>
            </div>
          </div>

          {/* Mobile: collapsible section (expanded by default) */}
          <div className="md:hidden">
            <div className="bg-gray-50 rounded-[var(--radius-lg)] border border-gray-100 shadow-subtle overflow-hidden">
              <button
                type="button"
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                className="w-full flex items-center justify-between p-4 text-left"
                aria-expanded={summaryExpanded}
                aria-controls="mobile-order-summary"
              >
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-base text-gray-900">Đơn hàng của bạn</h2>
                  <span className="text-sm text-gray-500">({cart.totalItems} sản phẩm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--color-primary)]">
                    {formatPrice(cart.totalAmount)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      summaryExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              <div
                id="mobile-order-summary"
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  summaryExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-4 space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-start text-sm gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-700 block truncate">{item.name}</span>
                        <span className="text-gray-400 text-xs">x{item.quantity}</span>
                      </div>
                      <span className="font-medium text-gray-900 whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Tổng cộng:</span>
                      <span className="font-bold text-lg text-[var(--color-primary)]">
                        {formatPrice(cart.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
