"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OrderStatus } from "@/lib/constants"
import { updateOrderStatus } from "../actions"

const STATUS_LABELS: Record<string, string> = {
  [OrderStatus.Pending]: "Chờ xác nhận",
  [OrderStatus.Confirmed]: "Xác nhận",
  [OrderStatus.Shipping]: "Giao hàng",
  [OrderStatus.Delivered]: "Đã giao",
  [OrderStatus.Cancelled]: "Hủy đơn",
}

const STATUS_BUTTON_COLORS: Record<string, string> = {
  [OrderStatus.Confirmed]: "bg-blue-600 hover:bg-blue-700 text-white",
  [OrderStatus.Shipping]: "bg-purple-600 hover:bg-purple-700 text-white",
  [OrderStatus.Delivered]: "bg-green-600 hover:bg-green-700 text-white",
  [OrderStatus.Cancelled]: "bg-red-600 hover:bg-red-700 text-white",
}

interface OrderStatusActionsProps {
  orderId: string
  currentStatus: OrderStatus
  validNextStatuses: OrderStatus[]
}

export default function OrderStatusActions({
  orderId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentStatus,
  validNextStatuses,
}: OrderStatusActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<OrderStatus | null>(null)
  const router = useRouter()

  async function handleStatusUpdate(newStatus: OrderStatus) {
    setIsLoading(newStatus)
    setError(null)
    setShowConfirm(null)

    const result = await updateOrderStatus(orderId, newStatus)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Đã xảy ra lỗi.")
    }

    setIsLoading(null)
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showConfirm && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 mb-3">
            {showConfirm === OrderStatus.Cancelled
              ? "Bạn có chắc muốn hủy đơn hàng? Tồn kho sẽ được hoàn lại."
              : `Bạn có chắc muốn chuyển trạng thái sang "${STATUS_LABELS[showConfirm]}"?`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusUpdate(showConfirm)}
              disabled={isLoading !== null}
              className="px-3 py-1.5 text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận"}
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              disabled={isLoading !== null}
              className="px-3 py-1.5 text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {validNextStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setShowConfirm(status)}
            disabled={isLoading !== null || showConfirm !== null}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              STATUS_BUTTON_COLORS[status] || "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            {isLoading === status
              ? "Đang xử lý..."
              : STATUS_LABELS[status] || status}
          </button>
        ))}
      </div>
    </div>
  )
}
