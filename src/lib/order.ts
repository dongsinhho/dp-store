import { OrderItem } from "./types"

/**
 * Calculates the total amount for an order based on its items.
 * The total equals the sum of (price × quantity) for all order items.
 */
export function calculateOrderTotal(
  items: Pick<OrderItem, "price" | "quantity">[]
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/**
 * Calculates the remaining stock after an order operation.
 *
 * Preconditions:
 * - currentStock >= 0
 * - orderQuantity >= 0
 * - orderQuantity <= currentStock
 *
 * Returns the new stock value (currentStock - orderQuantity).
 * Throws an error if the operation would result in negative stock.
 */
export function calculateRemainingStock(
  currentStock: number,
  orderQuantity: number
): number {
  if (orderQuantity > currentStock) {
    throw new Error(
      `Insufficient stock: cannot deduct ${orderQuantity} from ${currentStock}`
    )
  }
  return currentStock - orderQuantity
}
