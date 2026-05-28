"use server"

import { getAuthenticatedPb } from "@/lib/admin-auth"
import { validateTradeInTransition } from "@/lib/status-transitions"
import { TradeInStatus, TRADE_IN_STATUS_TRANSITIONS } from "@/lib/constants"
import { calculatePriceDifference } from "@/lib/trade-in"
import { revalidatePath } from "next/cache"

export interface TradeInActionResult {
  success: boolean
  error?: string
}

/**
 * Fetches all trade-in requests for the admin list page.
 */
export async function getTradeInRequests() {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required")
  }

  const records = await pb.collection("trade_in_requests").getList(1, 50, {
    sort: "-created",
    expand: "new_product",
  })

  return records
}

/**
 * Fetches a single trade-in request by ID.
 */
export async function getTradeInRequest(id: string) {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required")
  }

  const record = await pb.collection("trade_in_requests").getOne(id, {
    expand: "new_product",
  })

  return record
}

/**
 * Updates the status of a trade-in request.
 * When transitioning to "evaluated", requires trade_in_value > 0.
 * Auto-calculates price_difference if new_product is specified.
 */
export async function updateTradeInStatus(
  id: string,
  newStatus: TradeInStatus,
  data?: { trade_in_value?: number; admin_notes?: string }
): Promise<TradeInActionResult> {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin access required" }
  }

  try {
    // Get current record
    const record = await pb.collection("trade_in_requests").getOne(id, {
      expand: "new_product",
    })

    const currentStatus = record.status as TradeInStatus

    // Validate transition
    const transition = validateTradeInTransition(currentStatus, newStatus)
    if (!transition.valid) {
      return { success: false, error: transition.error }
    }

    // When transitioning to "evaluated", require trade_in_value
    if (newStatus === TradeInStatus.Evaluated) {
      if (!data?.trade_in_value || data.trade_in_value <= 0) {
        return {
          success: false,
          error: "Giá trị thu cũ (trade_in_value) phải lớn hơn 0 khi chuyển sang trạng thái 'Đã định giá'",
        }
      }
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
    }

    if (data?.admin_notes !== undefined) {
      updatePayload.admin_notes = data.admin_notes
    }

    // Handle evaluation: set trade_in_value and calculate price_difference
    if (newStatus === TradeInStatus.Evaluated && data?.trade_in_value) {
      updatePayload.trade_in_value = data.trade_in_value

      // Calculate price_difference if new_product is specified
      if (record.new_product && record.expand?.new_product) {
        const newProductPrice = record.expand.new_product.price
        updatePayload.price_difference = calculatePriceDifference(
          newProductPrice,
          data.trade_in_value
        )
      } else {
        // No new product selected, set price_difference to null
        updatePayload.price_difference = null
      }
    }

    await pb.collection("trade_in_requests").update(id, updatePayload)

    revalidatePath("/admin/thu-cu")
    revalidatePath(`/admin/thu-cu/${id}`)

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Có lỗi xảy ra"
    return { success: false, error: message }
  }
}

/**
 * Get valid next statuses for a given trade-in status.
 */
export function getValidNextStatuses(currentStatus: TradeInStatus): TradeInStatus[] {
  return TRADE_IN_STATUS_TRANSITIONS[currentStatus] || []
}
