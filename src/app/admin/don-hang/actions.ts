"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedPb } from "@/lib/admin-auth"
import { validateOrderTransition } from "@/lib/status-transitions"
import { OrderStatus } from "@/lib/constants"

export interface UpdateOrderStatusResult {
  success: boolean
  error?: string
}

/**
 * Updates an order's status with validation.
 * - Only allows valid transitions (pending→confirmed→shipping→delivered, cancellation from pending/confirmed)
 * - On cancellation: restores stock for all order items
 * - Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateOrderStatusResult> {
  const { pb, isAdmin } = await getAuthenticatedPb()

  if (!isAdmin) {
    return { success: false, error: "Không có quyền truy cập." }
  }

  try {
    // Fetch the current order
    const order = await pb.collection("orders").getOne(orderId)
    const currentStatus = order.status as OrderStatus

    // Validate the transition
    const transitionResult = validateOrderTransition(currentStatus, newStatus)
    if (!transitionResult.valid) {
      return { success: false, error: transitionResult.error }
    }

    // If cancelling, restore stock for all order items
    if (newStatus === OrderStatus.Cancelled) {
      const orderItems = await pb.collection("order_items").getFullList({
        filter: `order = "${orderId}"`,
      })

      for (const item of orderItems) {
        const product = await pb.collection("products").getOne(item.product)
        await pb.collection("products").update(item.product, {
          stock: product.stock + item.quantity,
        })
      }
    }

    // Update the order status
    await pb.collection("orders").update(orderId, {
      status: newStatus,
    })

    revalidatePath("/admin/don-hang")
    revalidatePath(`/admin/don-hang/${orderId}`)

    return { success: true }
  } catch (err) {
    console.error("Failed to update order status:", err)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng.",
    }
  }
}
