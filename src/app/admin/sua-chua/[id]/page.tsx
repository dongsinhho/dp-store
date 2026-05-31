"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { pb } from "@/lib/pocketbase"
import { RepairStatus, REPAIR_STATUS_TRANSITIONS } from "@/lib/constants"
import { updateRepairStatus, updateRepairDiagnosis } from "../actions"

const STATUS_LABELS: Record<string, string> = {
  [RepairStatus.Pending]: "Chờ tiếp nhận",
  [RepairStatus.Diagnosing]: "Đang chẩn đoán",
  [RepairStatus.Quoted]: "Đã báo giá",
  [RepairStatus.Confirmed]: "Đã xác nhận",
  [RepairStatus.Repairing]: "Đang sửa",
  [RepairStatus.Completed]: "Hoàn thành",
  [RepairStatus.Delivered]: "Đã trả máy",
  [RepairStatus.Cancelled]: "Đã hủy",
}

const STATUS_COLORS: Record<string, string> = {
  [RepairStatus.Pending]: "bg-yellow-100 text-yellow-800",
  [RepairStatus.Diagnosing]: "bg-blue-100 text-blue-800",
  [RepairStatus.Quoted]: "bg-purple-100 text-purple-800",
  [RepairStatus.Confirmed]: "bg-indigo-100 text-indigo-800",
  [RepairStatus.Repairing]: "bg-orange-100 text-orange-800",
  [RepairStatus.Completed]: "bg-green-100 text-green-800",
  [RepairStatus.Delivered]: "bg-gray-100 text-gray-800",
  [RepairStatus.Cancelled]: "bg-red-100 text-red-800",
}

interface RepairRequestData {
  id: string
  customer_name: string
  customer_phone: string
  device_model: string
  issue_description: string
  images?: string[]
  status: RepairStatus
  estimated_cost?: number
  actual_cost?: number
  diagnosis?: string
  estimated_days?: number
  created: string
  updated: string
  collectionId?: string
}

export default function AdminRepairDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const [request, setRequest] = useState<RepairRequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Form fields for diagnosis and cost
  const [diagnosis, setDiagnosis] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")

  const fetchRequest = useCallback(async () => {
    try {
      const record = await pb.collection("repair_requests").getOne(requestId)
      const data = record as unknown as RepairRequestData
      setRequest(data)
      setDiagnosis(data.diagnosis || "")
      setEstimatedCost(data.estimated_cost ? String(data.estimated_cost) : "")
      setError(null)
    } catch (e) {
      console.error("Failed to fetch repair request:", e)
      setError("Không thể tải thông tin yêu cầu sửa chữa.")
    } finally {
      setLoading(false)
    }
  }, [requestId])

  // Initial fetch
  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  // Realtime subscription for status updates
  useEffect(() => {
    const unsubscribePromise = pb
      .collection("repair_requests")
      .subscribe(requestId, (e) => {
        if (e.action === "update") {
          const updatedData = e.record as unknown as RepairRequestData
          setRequest(updatedData)
          setDiagnosis(updatedData.diagnosis || "")
          setEstimatedCost(
            updatedData.estimated_cost ? String(updatedData.estimated_cost) : ""
          )
        } else if (e.action === "delete") {
          router.push("/admin/sua-chua")
        }
      })

    return () => {
      unsubscribePromise.then(() => {
        pb.collection("repair_requests").unsubscribe(requestId)
      })
    }
  }, [requestId, router])

  async function handleStatusUpdate(newStatus: RepairStatus) {
    if (!request) return

    setIsUpdating(true)
    setActionError(null)
    setActionSuccess(null)

    const data: { estimated_cost?: number; diagnosis?: string } = {}

    // Include diagnosis if provided
    if (diagnosis.trim()) {
      data.diagnosis = diagnosis.trim()
    }

    // Include estimated_cost when transitioning to quoted
    if (newStatus === RepairStatus.Quoted) {
      const cost = parseFloat(estimatedCost)
      if (!estimatedCost || isNaN(cost) || cost <= 0) {
        setActionError("Vui lòng nhập chi phí dự kiến (lớn hơn 0) khi báo giá")
        setIsUpdating(false)
        return
      }
      data.estimated_cost = cost
    }

    const result = await updateRepairStatus(requestId, newStatus, data)

    if (result.success) {
      setActionSuccess(
        `Đã cập nhật trạng thái thành "${STATUS_LABELS[newStatus]}"`
      )
      // Refresh data (realtime will also update, but this ensures immediate feedback)
      await fetchRequest()
    } else {
      setActionError(result.error || "Có lỗi xảy ra")
    }

    setIsUpdating(false)
  }

  async function handleSaveDiagnosis() {
    if (!request) return

    setIsUpdating(true)
    setActionError(null)
    setActionSuccess(null)

    const data: { diagnosis?: string; estimated_cost?: number } = {}

    if (diagnosis.trim()) {
      data.diagnosis = diagnosis.trim()
    }

    if (estimatedCost) {
      const cost = parseFloat(estimatedCost)
      if (isNaN(cost) || cost <= 0) {
        setActionError("Chi phí dự kiến phải lớn hơn 0")
        setIsUpdating(false)
        return
      }
      data.estimated_cost = cost
    }

    const result = await updateRepairDiagnosis(requestId, data)

    if (result.success) {
      setActionSuccess("Đã lưu thông tin chẩn đoán")
      await fetchRequest()
    } else {
      setActionError(result.error || "Có lỗi xảy ra")
    }

    setIsUpdating(false)
  }

  function getImageUrl(filename: string): string {
    if (!request) return ""
    return pb.files.getURL(request as unknown as { id: string; collectionId: string; collectionName: string }, filename)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Đang tải...</div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-sm mb-4">
          {error || "Không tìm thấy yêu cầu sửa chữa."}
        </div>
        <Link
          href="/admin/sua-chua"
          className="text-primary hover:text-blue-800"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  const currentStatus = request.status as RepairStatus
  const validNextStatuses = REPAIR_STATUS_TRANSITIONS[currentStatus] || []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin/sua-chua"
            className="text-sm text-primary hover:text-blue-800 mb-2 inline-block"
          >
            ← Quay lại danh sách
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">
            Chi tiết yêu cầu sửa chữa
          </h1>
        </div>
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            STATUS_COLORS[currentStatus] || "bg-gray-100 text-gray-800"
          }`}
        >
          {STATUS_LABELS[currentStatus] || currentStatus}
        </span>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-sm mb-4">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-sm mb-4">
          {actionSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-md shadow-subtle p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Thông tin khách hàng
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-neutral-500">Họ tên</dt>
              <dd className="text-sm text-neutral-900">{request.customer_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">
                Số điện thoại
              </dt>
              <dd className="text-sm text-neutral-900">
                {request.customer_phone}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">Ngày gửi</dt>
              <dd className="text-sm text-neutral-900">
                {new Date(request.created).toLocaleString("vi-VN")}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">
                Cập nhật lần cuối
              </dt>
              <dd className="text-sm text-neutral-900">
                {new Date(request.updated).toLocaleString("vi-VN")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Device Info */}
        <div className="bg-white rounded-md shadow-subtle p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Thông tin thiết bị
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-neutral-500">Model</dt>
              <dd className="text-sm text-neutral-900">{request.device_model}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">Mô tả lỗi</dt>
              <dd className="text-sm text-neutral-900 whitespace-pre-wrap">
                {request.issue_description}
              </dd>
            </div>
          </dl>
        </div>

        {/* Images */}
        {request.images && request.images.length > 0 && (
          <div className="bg-white rounded-md shadow-subtle p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Hình ảnh
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {request.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-sm overflow-hidden border border-neutral-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(image)}
                    alt={`Ảnh thiết bị ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnosis & Cost */}
        <div className="bg-white rounded-md shadow-subtle p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Chẩn đoán & Báo giá
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="diagnosis"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Chẩn đoán
              </label>
              <textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-sm shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="Nhập kết quả chẩn đoán..."
              />
            </div>
            <div>
              <label
                htmlFor="estimated_cost"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Chi phí dự kiến (VND)
                {validNextStatuses.includes(RepairStatus.Quoted) && (
                  <span className="text-error ml-1">
                    * Bắt buộc khi báo giá
                  </span>
                )}
              </label>
              <input
                id="estimated_cost"
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-neutral-300 rounded-sm shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="Nhập chi phí dự kiến..."
              />
            </div>
            <button
              onClick={handleSaveDiagnosis}
              disabled={isUpdating}
              className="px-4 py-2 bg-neutral-600 text-white text-sm font-medium rounded-sm hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Đang lưu..." : "Lưu chẩn đoán"}
            </button>
          </div>
        </div>

        {/* Status Update Actions */}
        <div className="bg-white rounded-md shadow-subtle p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Cập nhật trạng thái
          </h2>

          {validNextStatuses.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Trạng thái hiện tại là trạng thái cuối cùng, không thể chuyển
              tiếp.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {validNextStatuses.map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={isUpdating}
                  className={`px-4 py-2 text-sm font-medium rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    nextStatus === RepairStatus.Cancelled
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {isUpdating
                    ? "Đang xử lý..."
                    : `Chuyển sang "${STATUS_LABELS[nextStatus]}"`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
