import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { getCartBadgeText } from "./Header"

/**
 * Property 3: Cart badge display logic
 * Validates: Requirements 2.4
 *
 * For any non-negative integer representing the cart item count, the badge display SHALL satisfy:
 * - if count equals 0 then the badge is hidden (returns null)
 * - if count is between 1 and 99 inclusive then the badge displays the exact numeric count as a string
 * - if count exceeds 99 then the badge displays "99+"
 */

describe("Property 3: Cart badge display logic", () => {
  it("returns null (badge hidden) when count is 0", () => {
    expect(getCartBadgeText(0)).toBeNull()
  })

  it("returns the exact numeric string for any count between 1 and 99 inclusive", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }),
        (count) => {
          const result = getCartBadgeText(count)
          expect(result).toBe(String(count))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns "99+" for any count exceeding 99', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 100000 }),
        (count) => {
          const result = getCartBadgeText(count)
          expect(result).toBe("99+")
        }
      ),
      { numRuns: 100 }
    )
  })

  it("satisfies the complete badge display property for any non-negative integer", () => {
    fc.assert(
      fc.property(
        fc.nat(), // non-negative integer (0, 1, 2, ...)
        (count) => {
          const result = getCartBadgeText(count)

          if (count === 0) {
            expect(result).toBeNull()
          } else if (count >= 1 && count <= 99) {
            expect(result).toBe(String(count))
          } else {
            // count > 99
            expect(result).toBe("99+")
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
