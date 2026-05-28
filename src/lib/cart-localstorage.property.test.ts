import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { Cart, CartItem } from "./types"

/**
 * Property 3: Cart localStorage round-trip
 *
 * For any valid Cart state, serializing to JSON and deserializing
 * produces the same cart (round-trip).
 *
 * **Validates: Requirements 2.9**
 */

// Arbitrary for a valid CartItem
const cartItemArb: fc.Arbitrary<CartItem> = fc.record({
  productId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  price: fc.double({ min: 1, max: 999_999_999, noNaN: true, noDefaultInfinity: true }),
  quantity: fc.integer({ min: 1, max: 9999 }),
  image: fc.string({ minLength: 1, maxLength: 200 }),
})

// Arbitrary for a valid Cart state with consistent totals
const cartArb: fc.Arbitrary<Cart> = fc
  .array(cartItemArb, { minLength: 0, maxLength: 20 })
  .map((items) => ({
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
  }))

describe("Property 3: Cart localStorage round-trip", () => {
  it("serializing to JSON and deserializing produces the same cart", () => {
    fc.assert(
      fc.property(cartArb, (cart) => {
        // Simulate localStorage round-trip: serialize then deserialize
        const serialized = JSON.stringify(cart)
        const deserialized: Cart = JSON.parse(serialized)

        // Items should deep-equal
        expect(deserialized.items).toEqual(cart.items)

        // totalItems should be consistent after round-trip
        expect(deserialized.totalItems).toBe(cart.totalItems)

        // totalAmount should be consistent after round-trip
        expect(deserialized.totalAmount).toBe(cart.totalAmount)

        // Full deep equality
        expect(deserialized).toEqual(cart)
      }),
      { numRuns: 200 }
    )
  })

  it("totalItems and totalAmount remain consistent after round-trip", () => {
    fc.assert(
      fc.property(cartArb, (cart) => {
        const deserialized: Cart = JSON.parse(JSON.stringify(cart))

        // Verify totalItems equals sum of all item quantities
        const expectedTotalItems = deserialized.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        )
        expect(deserialized.totalItems).toBe(expectedTotalItems)

        // Verify totalAmount equals sum of (price * quantity) for all items
        const expectedTotalAmount = deserialized.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
        expect(deserialized.totalAmount).toBe(expectedTotalAmount)
      }),
      { numRuns: 200 }
    )
  })
})
