"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { pb } from "@/lib/pocketbase"
import { TradeInStatus, TRADE_IN_STATUS_TRANSITIONS } from "@/lib/constants"
import { validateTradeInTransition } from "@/lib/status-transitions"
import { calculatePriceDifference } from "@/lib/trade-in"

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ định giá",
  evaluated: "Đã định giá",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  evaluated: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  processing: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

interface TradeInRecord {
  id: string
  customer_name: string
  customer_phone: string
  old_device_model: string
  old_device_storage: string
  old_device_condition: string
  old_device_battery?: number
  old_device_images?: string[]
  new_product?: string
  trade_in_value?: number
  price_difference?: number | null
  status: string
  admin_notes?: string
  created: string
  updated: string
  expand?: {
    new_product?: {
      id: string
      name: string
      price: number
      condition: string
      storage: string
      color: string
      images: string[]
    }
  }
}

export default function AdminTradeInDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [record, setRecord] = useState<TradeInRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Evaluation form state
  const [tradeInValue, setTradeInValue] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState<string>("")

  const fetchRecord = useCallback(async () => {
    try {
      const result = await pb.collection("trade_in_requests").getOne(id, {
        expand: "new_product",
      })
      setRecord(result as unknown as TradeInRecord)
      setError(null)

      // Pre-fill form values if already evaluated
      if (result.trade_in_value) {
        setTradeInValue(String(result.trade_in_value))
      }
      if (result.admin_notes) {
        setAdminNotes(result.admin_notes)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }, [id])

  // Initial fetch
  useEffect(() => {
    fetchRecord()
  }, [fetchRecord])

  // Realtime subscription
  useEffect(() => {
    const unsubscribePromise = pb
      .collection("trade_in_requests")
      .subscribe(id, (event) => {
        if (event.action === "update") {
          // Re-fetch to get expanded relations
          fetchRecord()
        }
      })

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe()
        }
      })
      // Also try the PocketBase unsubscribe method
      pb.collection("trade_in_requests").unsubscribe(id)
    }
  }, [id, fetchRecord])

  // Calculate price difference in real-time as user types trade_in_value
  const calculatedPriceDifference = (() => {
    const value = parseFloat(tradeInValue)
    if (isNaN(value) || value <= 0) return null
    if (!record?.expand?.new_product) return null
    return calculatePriceDifference(record.expand.new_product.price, value)
  })()

  async function handleStatusUpdate(newStatus: TradeInStatus) {
    if (!record) return

    setActionLoading(true)
    setActionError(null)

    try {
      const currentStatus = record.status as TradeInStatus

      // Client-side validation
      const transition = validateTradeInTransition(currentStatus, newStatus)
      if (!transition.valid) {
        setActionError(transition.error || "Chuyển trạng thái không hợp lệ")
        setActionLoading(false)
        return
      }

      // When transitioning to "evaluated", require trade_in_value
      if (newStatus === TradeInStatus.Evaluated) {
        const value = parseFloat(tradeInValue)
        if (!tradeInValue || isNaN(value) || value <= 0) {
          setActionError(
            "Vui lòng nhập giá trị thu cũ (trade_in_value) lớn hơn 0"
          )
          setActionLoading(false)
          return
        }
      }

      // Build update payload
      const updatePayload: Record<string, unknown> = {
        status: newStatus,
      }

      if (adminNotes) {
        updatePayload.admin_notes = adminNotes
      }

      // Handle evaluation
      if (newStatus === TradeInStatus.Evaluated) {
        const value = parseFloat(tradeInValue)
        updatePayload.trade_in_value = value

        // Calculate price_difference if new_product is specified
        if (record.new_product && record.expand?.new_product) {
          updatePayload.price_difference = calculatePriceDifference(
            record.expand.new_product.price,
            value
          )
        } else {
          updatePayload.price_difference = null
        }
      }

      await pb.collection("trade_in_requests").update(id, updatePayload)

      // Re-fetch to get updated data
      await fetchRecord()
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật"
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || "Không tìm thấy yêu cầu"}</p>
        <Link
          href="/admin/thu-cu"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  const currentStatus = record.status as TradeInStatus
  const validNextStatuses = TRADE_IN_STATUS_TRANSITIONS[currentStatus] || []

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/thu-cu"
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Chi tiết yêu cầu thu cũ
        </h1>
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[record.status] || "bg-gray-100 text-gray-800"}`}
        >
          {STATUS_LABELS[record.status] || record.status}
        </span>
      </div>

      {/* Error message */}
      {actionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin khách hàng
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Họ tên</dt>
              <dd className="text-sm font-medium text-gray-900">
                {record.customer_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Số điện thoại</dt>
              <dd className="text-sm font-medium text-gray-900">
                {record.customer_phone}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Ngày gửi</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(record.created).toLocaleString("vi-VN")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Old Device Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin máy cũ
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Model</dt>
              <dd className="text-sm font-medium text-gray-900">
                {record.old_device_model}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Dung lượng</dt>
              <dd className="text-sm font-medium text-gray-900">
                {record.old_device_storage}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Tình trạng</dt>
              <dd className="text-sm text-gray-900">
                {record.old_device_condition}
              </dd>
            </div>
            {record.old_device_battery !== undefined && record.old_device_battery !== null && (
              <div>
                <dt className="text-sm text-gray-500">Pin</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {record.old_device_battery}%
                </dd>
              </div>
            )}
          </dl>

          {/* Old device images */}
          {record.old_device_images && record.old_device_images.length > 0 && (
            <div className="mt-4">
              <dt className="text-sm text-gray-500 mb-2">Ảnh máy cũ</dt>
              <div className="flex gap-2 flex-wrap">
                {record.old_device_images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={pb.files.getUrl(record, img)}
                    alt={`Ảnh máy cũ ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded border"
                    unoptimized
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New Product Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sản phẩm muốn đổi
          </h2>
          {record.expand?.new_product ? (
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Tên sản phẩm</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {record.expand.new_product.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Giá bán</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {record.expand.new_product.price.toLocaleString("vi-VN")}đ
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Tình trạng</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {record.expand.new_product.condition === "new" ? "Mới" : "Cũ"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Dung lượng</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {record.expand.new_product.storage}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Màu sắc</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {record.expand.new_product.color}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">
              Khách hàng chưa chọn sản phẩm mới
            </p>
          )}
        </div>

        {/* Evaluation Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Định giá & Xử lý
          </h2>

          <div className="space-y-4">
            {/* Trade-in value input */}
            <div>
              <label
                htmlFor="trade_in_value"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Giá trị thu cũ (VND)
              </label>
              <input
                id="trade_in_value"
                type="number"
                min="0"
                value={tradeInValue}
                onChange={(e) => setTradeInValue(e.target.value)}
                placeholder="Nhập giá trị thu cũ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={
                  currentStatus !== TradeInStatus.Pending && currentStatus !== TradeInStatus.Evaluated
                }
              />
            </div>

            {/* Auto-calculated price difference */}
            {record.expand?.new_product && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền bù thêm (tự động tính)
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {calculatedPriceDifference !== null ? (
                    <span
                      className={
                        calculatedPriceDifference > 0
                          ? "text-red-600 font-medium"
                          : "text-green-600 font-medium"
                      }
                    >
                      {calculatedPriceDifference > 0
                        ? `Khách bù thêm: ${calculatedPriceDifference.toLocaleString("vi-VN")}đ`
                        : calculatedPriceDifference === 0
                          ? "Hòa vốn"
                          : `Hoàn lại khách: ${Math.abs(calculatedPriceDifference).toLocaleString("vi-VN")}đ`}
                    </span>
                  ) : record.price_difference !== null &&
                    record.price_difference !== undefined ? (
                    <span className="text-gray-700">
                      {record.price_difference > 0
                        ? `Khách bù thêm: ${record.price_difference.toLocaleString("vi-VN")}đ`
                        : record.price_difference === 0
                          ? "Hòa vốn"
                          : `Hoàn lại khách: ${Math.abs(record.price_difference).toLocaleString("vi-VN")}đ`}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Nhập giá trị thu cũ để tính
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Công thức: Giá sản phẩm mới ({record.expand.new_product.price.toLocaleString("vi-VN")}đ) - Giá thu cũ
                </p>
              </div>
            )}

            {/* Saved trade_in_value display */}
            {record.trade_in_value && currentStatus !== TradeInStatus.Pending && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Đã định giá:</strong>{" "}
                  {record.trade_in_value.toLocaleString("vi-VN")}đ
                </p>
                {record.price_difference !== null &&
                  record.price_difference !== undefined && (
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Chênh lệch:</strong>{" "}
                      {record.price_difference > 0
                        ? `Khách bù ${record.price_difference.toLocaleString("vi-VN")}đ`
                        : record.price_difference === 0
                          ? "Hòa vốn"
                          : `Hoàn ${Math.abs(record.price_difference).toLocaleString("vi-VN")}đ`}
                    </p>
                  )}
              </div>
            )}

            {/* Admin notes */}
            <div>
              <label
                htmlFor="admin_notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ghi chú admin
              </label>
              <textarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ghi chú nội bộ..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Actions */}
      {validNextStatuses.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cập nhật trạng thái
          </h2>
          <div className="flex flex-wrap gap-3">
            {validNextStatuses.map((nextStatus) => {
              const isCancelled = nextStatus === TradeInStatus.Cancelled
              return (
                <button
                  key={nextStatus}
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCancelled
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {actionLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </span>
                  ) : (
                    `Chuyển sang: ${STATUS_LABELS[nextStatus] || nextStatus}`
                  )}
                </button>
              )
            })}
          </div>
          {currentStatus === TradeInStatus.Pending && (
            <p className="mt-3 text-xs text-gray-500">
              * Để chuyển sang &quot;Đã định giá&quot;, vui lòng nhập giá trị thu cũ ở trên.
            </p>
          )}
        </div>
      )}

      {/* Timeline / Updated info */}
      <div className="mt-6 text-sm text-gray-500">
        <p>Cập nhật lần cuối: {new Date(record.updated).toLocaleString("vi-VN")}</p>
      </div>
    </div>
  )
}
