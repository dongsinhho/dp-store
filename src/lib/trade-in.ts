/**
 * Trade-in price calculation utilities.
 *
 * When a customer trades in an old device for a new product,
 * the price difference determines how much additional payment is needed.
 */

export interface PriceDifferenceResult {
  /** The amount the customer needs to pay (positive) or receives back (negative/zero) */
  priceDifference: number
}

/**
 * Calculates the price difference for a trade-in transaction.
 *
 * @param newProductPrice - The price of the new product the customer wants
 * @param tradeInValue - The evaluated value of the customer's old device
 * @returns The price difference (new product price - trade-in value)
 *
 * Postconditions:
 * - If tradeInValue >= newProductPrice, priceDifference <= 0 (customer breaks even or gets money back)
 * - If tradeInValue < newProductPrice, priceDifference > 0 (customer pays the difference)
 * - priceDifference always equals exactly (newProductPrice - tradeInValue)
 */
export function calculatePriceDifference(
  newProductPrice: number,
  tradeInValue: number
): number {
  return newProductPrice - tradeInValue
}
