import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { calculateOrderTotal, calculateRemainingStock } from "./order"

// --- Generators ---

/**
 * Generates a valid order item with positive price and quantity.
 */
const orderItemArb = fc.record({
  price: fc.integer({ min: 1, max: 999_999_999 }),
  quantity: fc.integer({ min: 1, max: 100 }),
})

/**
 * Generates a list of order items (1 to 20 items).
 */
const orderItemsArb = fc.array(orderItemArb, { minLength: 1, maxLength: 20 })

/**
 * Generates a valid stock value for a product.
 */
const stockArb = fc.integer({ min: 0, max: 9999 })

/**
 * Generates a stock and a valid order quantity where quantity <= stock.
 */
const stockAndQuantityArb = fc
  .integer({ min: 1, max: 9999 })
  .chain((stock) =>
    fc
      .integer({ min: 1, max: stock })
      .map((quantity) => ({ stock, quantity }))
  )

// --- Property Tests ---

/**
 * Property 4: Order total matches items
 * Validates: Requirements 3.10
 *
 * For any set of order items (with price and quantity), the order total
 * should always equal the sum of (price × quantity) for all items.
 */
describe("Property 4: Order total matches items", () => {
  it("order total equals sum of (price × quantity) for all items", () => {
    fc.assert(
      fc.property(orderItemsArb, (items) => {
        const total = calculateOrderTotal(items)

        const expectedTotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )

        expect(total).toBe(expectedTotal)
      }),
      { numRuns: 1000 }
    )
  })

  it("order total is always non-negative for valid items", () => {
    fc.assert(
      fc.property(orderItemsArb, (items) => {
        const total = calculateOrderTotal(items)
        expect(total).toBeGreaterThan(0)
      }),
      { numRuns: 1000 }
    )
  })

  it("order total for a single item equals price × quantity", () => {
    fc.assert(
      fc.property(orderItemArb, (item) => {
        const total = calculateOrderTotal([item])
        expect(total).toBe(item.price * item.quantity)
      }),
      { numRuns: 1000 }
    )
  })

  it("order total for empty items is zero", () => {
    const total = calculateOrderTotal([])
    expect(total).toBe(0)
  })

  it("order total is additive (sum of individual item totals)", () => {
    fc.assert(
      fc.property(orderItemsArb, (items) => {
        const combinedTotal = calculateOrderTotal(items)

        const sumOfIndividuals = items.reduce(
          (sum, item) => sum + calculateOrderTotal([item]),
          0
        )

        expect(combinedTotal).toBe(sumOfIndividuals)
      }),
      { numRuns: 1000 }
    )
  })
})

/**
 * Property 5: Stock non-negativity
 * Validates: Requirements 4.5, 9.2
 *
 * For any product with stock S and any order quantity Q where Q <= S,
 * the resulting stock (S - Q) should always be >= 0.
 */
describe("Property 5: Stock non-negativity", () => {
  it("remaining stock is always non-negative when quantity <= stock", () => {
    fc.assert(
      fc.property(stockAndQuantityArb, ({ stock, quantity }) => {
        const remaining = calculateRemainingStock(stock, quantity)
        expect(remaining).toBeGreaterThanOrEqual(0)
      }),
      { numRuns: 1000 }
    )
  })

  it("remaining stock equals stock minus quantity", () => {
    fc.assert(
      fc.property(stockAndQuantityArb, ({ stock, quantity }) => {
        const remaining = calculateRemainingStock(stock, quantity)
        expect(remaining).toBe(stock - quantity)
      }),
      { numRuns: 1000 }
    )
  })

  it("ordering zero quantity leaves stock unchanged", () => {
    fc.assert(
      fc.property(stockArb, (stock) => {
        const remaining = calculateRemainingStock(stock, 0)
        expect(remaining).toBe(stock)
      }),
      { numRuns: 500 }
    )
  })

  it("ordering full stock results in zero remaining", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9999 }),
        (stock) => {
          const remaining = calculateRemainingStock(stock, stock)
          expect(remaining).toBe(0)
        }
      ),
      { numRuns: 500 }
    )
  })

  it("throws error when quantity exceeds stock (prevents negative stock)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9998 }).chain((stock) =>
          fc
            .integer({ min: stock + 1, max: stock + 100 })
            .map((quantity) => ({ stock, quantity }))
        ),
        ({ stock, quantity }) => {
          expect(() => calculateRemainingStock(stock, quantity)).toThrow()
        }
      ),
      { numRuns: 500 }
    )
  })

  it("sequential orders maintain non-negative stock", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 9999 }).chain((initialStock) =>
          fc
            .array(fc.integer({ min: 1, max: Math.max(1, Math.floor(initialStock / 3)) }), {
              minLength: 1,
              maxLength: 5,
            })
            .filter((quantities) => quantities.reduce((a, b) => a + b, 0) <= initialStock)
            .map((quantities) => ({ initialStock, quantities }))
        ),
        ({ initialStock, quantities }) => {
          let currentStock = initialStock

          for (const qty of quantities) {
            currentStock = calculateRemainingStock(currentStock, qty)
            expect(currentStock).toBeGreaterThanOrEqual(0)
          }
        }
      ),
      { numRuns: 1000 }
    )
  })
})
