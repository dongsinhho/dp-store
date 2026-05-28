"use server"

import { getAuthenticatedPb } from "@/lib/admin-auth"
import { validateRepairTransition } from "@/lib/status-transitions"
import { RepairStatus } from "@/lib/constants"

export interface UpdateRepairStatusResult {
  success: boolean
  error?: string
}

/**
 * Update repair request status with validation.
 * Requires estimated_cost when transitioning to "quoted" status.
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export async function updateRepairStatus(
  requestId: string,
  newStatus: RepairStatus,
  data?: { estimated_cost?: number; diagnosis?: string }
): Promise<UpdateRepairStatusResult> {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    return { success: false, error: "Không có quyền truy cập" }
  }

  try {
    // Fetch current repair request
    const request = await pb.collection("repair_requests").getOne(requestId)
    const currentStatus = request.status as RepairStatus

    // Validate transition
    const transition = validateRepairTransition(currentStatus, newStatus)
    if (!transition.valid) {
      return { success: false, error: transition.error }
    }

    // Require estimated_cost when transitioning to "quoted"
    if (newStatus === RepairStatus.Quoted) {
      if (!data?.estimated_cost || data.estimated_cost <= 0) {
        return {
          success: false,
          error: "Vui lòng nhập chi phí dự kiến (lớn hơn 0) khi báo giá",
        }
      }
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
    }

    if (data?.estimated_cost && newStatus === RepairStatus.Quoted) {
      updatePayload.estimated_cost = data.estimated_cost
    }

    if (data?.diagnosis !== undefined) {
      updatePayload.diagnosis = data.diagnosis
    }

    await pb.collection("repair_requests").update(requestId, updatePayload)

    return { success: true }
  } catch (error) {
    console.error("Failed to update repair status:", error)
    return {
      success: false,
      error: "Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.",
    }
  }
}

/**
 * Update repair request diagnosis and estimated cost without changing status.
 */
export async function updateRepairDiagnosis(
  requestId: string,
  data: { diagnosis?: string; estimated_cost?: number }
): Promise<UpdateRepairStatusResult> {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    return { success: false, error: "Không có quyền truy cập" }
  }

  try {
    const updatePayload: Record<string, unknown> = {}

    if (data.diagnosis !== undefined) {
      updatePayload.diagnosis = data.diagnosis
    }

    if (data.estimated_cost !== undefined) {
      if (data.estimated_cost <= 0) {
        return {
          success: false,
          error: "Chi phí dự kiến phải lớn hơn 0",
        }
      }
      updatePayload.estimated_cost = data.estimated_cost
    }

    if (Object.keys(updatePayload).length === 0) {
      return { success: false, error: "Không có dữ liệu để cập nhật" }
    }

    await pb.collection("repair_requests").update(requestId, updatePayload)

    return { success: true }
  } catch (error) {
    console.error("Failed to update repair diagnosis:", error)
    return {
      success: false,
      error: "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.",
    }
  }
}
