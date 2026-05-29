"use server"

import { createServerPb, createAdminPb } from "@/lib/pocketbase"
import { orderFormSchema } from "@/lib/validations"
import { CartItem } from "@/lib/types"

export interface StockConflict {
  productId: string
  productName: string
  requestedQuantity: number
  availableStock: number
}

export interface OrderResult {
  success: boolean
  orderId?: string
  error?: string
  stockConflicts?: StockConflict[]
}

interface CreateOrderInput {
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_address: string
  payment_method: "cod" | "bank_transfer"
  notes?: string
  items: CartItem[]
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  // Validate cart has items
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng." }
  }

  // Validate form data with Zod
  const formValidation = orderFormSchema.safeParse({
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_address: input.customer_address,
    payment_method: input.payment_method,
  })

  if (!formValidation.success) {
    const firstError = formValidation.error.issues[0]
    return { success: false, error: firstError.message }
  }

  let pb;
  try {
    pb = await createAdminPb()
  } catch {
    // Fallback to unauthenticated if admin auth fails
    pb = createServerPb()
  }

  try {
    // Verify stock availability for all items and collect current stock values
    const stockConflicts: StockConflict[] = []
    const productStocks = new Map<string, number>()

    for (const item of input.items) {
      try {
        const product = await pb.collection("products").getOne(item.productId)
        productStocks.set(item.productId, product.stock)
        if (product.stock < item.quantity) {
          stockConflicts.push({
            productId: item.productId,
            productName: item.name,
            requestedQuantity: item.quantity,
            availableStock: product.stock,
          })
        }
      } catch (err: unknown) {
        const isNotFound =
          err instanceof Object && "status" in err && (err as { status: number }).status === 404
        stockConflicts.push({
          productId: item.productId,
          productName: item.name,
          requestedQuantity: item.quantity,
          availableStock: 0,
        })
        if (isNotFound) {
          return {
            success: false,
            error: `Sản phẩm "${item.name}" không còn tồn tại. Vui lòng xóa khỏi giỏ hàng và thử lại.`,
            stockConflicts,
          }
        }
      }
    }

    if (stockConflicts.length > 0) {
      const errorMessages = stockConflicts.map(
        (c) => `Sản phẩm "${c.productName}" không đủ hàng. Còn lại: ${c.availableStock}`
      )
      return {
        success: false,
        error: errorMessages.join(". "),
        stockConflicts,
      }
    }

    // Calculate total amount
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Create order record
    const order = await pb.collection("orders").create({
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email || "",
      customer_address: input.customer_address,
      total_amount: totalAmount,
      status: "pending",
      payment_method: input.payment_method,
      notes: input.notes || "",
    })

    // Create order items and decrement stock
    for (const item of input.items) {
      // Create order item record
      await pb.collection("order_items").create({
        order: order.id,
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })

      // Decrement product stock using the value we already fetched
      const currentStock = productStocks.get(item.productId) ?? 0
      await pb.collection("products").update(item.productId, {
        stock: currentStock - item.quantity,
      })
    }

    return { success: true, orderId: order.id }
  } catch (err) {
    console.error("Order creation failed:", err)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.",
    }
  }
}
