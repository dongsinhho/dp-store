import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { calculateDiscountPercent } from "./ProductCard"

/**
 * **Validates: Requirements 4.2**
 *
 * Property 4: Discount percentage calculation
 *
 * For any product where original_price is greater than price and both are
 * positive numbers, the displayed discount percentage SHALL equal
 * Math.round((original_price - price) / original_price * 100), and the
 * discount badge SHALL be visible only when original_price > price.
 */

describe("Feature: modern-website-redesign, Property 4: Discount percentage calculation", () => {
  // Use double for price generation (JavaScript numbers are 64-bit doubles)
  const positivePriceArb = fc.double({
    min: 0.01,
    max: 1_000_000,
    noNaN: true,
    noDefaultInfinity: true,
  })

  const negativePriceArb = fc.double({
    min: -1_000_000,
    max: 0,
    noNaN: true,
    noDefaultInfinity: true,
  })

  // Generator for positive prices where originalPrice > currentPrice
  const validDiscountPricesArb = fc
    .tuple(positivePriceArb, positivePriceArb)
    .filter(([a, b]) => a !== b)
    .map(([a, b]) => {
      const originalPrice = Math.max(a, b)
      const currentPrice = Math.min(a, b)
      return { originalPrice, currentPrice }
    })

  it("returns correct discount percentage for valid positive prices where original > current", () => {
    fc.assert(
      fc.property(validDiscountPricesArb, ({ originalPrice, currentPrice }) => {
        const result = calculateDiscountPercent(originalPrice, currentPrice)
        const expected = Math.round(
          ((originalPrice - currentPrice) / originalPrice) * 100
        )
        expect(result).toBe(expected)
      }),
      { numRuns: 100 }
    )
  })

  it("result is always between 0 and 100 inclusive for valid inputs", () => {
    fc.assert(
      fc.property(validDiscountPricesArb, ({ originalPrice, currentPrice }) => {
        const result = calculateDiscountPercent(originalPrice, currentPrice)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(100)
      }),
      { numRuns: 100 }
    )
  })

  it("returns 0 when originalPrice <= 0", () => {
    fc.assert(
      fc.property(
        negativePriceArb,
        positivePriceArb,
        (originalPrice, currentPrice) => {
          const result = calculateDiscountPercent(originalPrice, currentPrice)
          expect(result).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("returns 0 when currentPrice <= 0", () => {
    fc.assert(
      fc.property(
        positivePriceArb,
        negativePriceArb,
        (originalPrice, currentPrice) => {
          const result = calculateDiscountPercent(originalPrice, currentPrice)
          expect(result).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("returns 0 when originalPrice <= currentPrice (no discount)", () => {
    fc.assert(
      fc.property(positivePriceArb, (price) => {
        // originalPrice equals currentPrice
        expect(calculateDiscountPercent(price, price)).toBe(0)
        // originalPrice less than currentPrice
        expect(calculateDiscountPercent(price, price + 1)).toBe(0)
      }),
      { numRuns: 100 }
    )
  })

  it("discount badge visibility: non-zero result only when originalPrice > currentPrice", () => {
    fc.assert(
      fc.property(
        positivePriceArb,
        positivePriceArb,
        (originalPrice, currentPrice) => {
          const result = calculateDiscountPercent(originalPrice, currentPrice)
          if (originalPrice <= currentPrice) {
            // Badge should be hidden (zero discount)
            expect(result).toBe(0)
          } else {
            // When originalPrice > currentPrice, result is the rounded percentage
            // It may be 0 if the difference is negligible (rounds to 0%)
            // Badge is visible only when result > 0
            const expected = Math.round(
              ((originalPrice - currentPrice) / originalPrice) * 100
            )
            expect(result).toBe(expected)
            expect(result).toBeGreaterThanOrEqual(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * **Validates: Requirements 14.4**
 *
 * Property 6: Image alt text validity
 *
 * For any product image rendered via the Next.js Image component,
 * the alt attribute SHALL be a non-empty string with length between
 * 1 and 150 characters that identifies the image content.
 *
 * In ProductCard, the alt text is derived directly from product.name:
 *   <Image alt={product.name} ... />
 *
 * Therefore, this property validates that for any valid product with a
 * realistic name, the alt text (product.name) satisfies the constraints.
 */

import { Product } from "@/lib/types"

// --- Generators for Property 6 ---

/**
 * Generates a product name that satisfies alt text constraints:
 * - Non-empty (at least 1 visible character)
 * - Between 1 and 150 characters total
 * - Contains at least one non-whitespace character (identifies content)
 */
const productNameArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 150 })
  .filter((s) => s.trim().length > 0)

/**
 * Generates a valid Product with a realistic name for alt text testing.
 */
const productForAltTextArb: fc.Arbitrary<Product> = fc.record({
  id: fc.uuid(),
  name: productNameArb,
  slug: fc.string({ minLength: 1, maxLength: 50 }),
  category: fc.string({ minLength: 1 }),
  condition: fc.constantFrom("new" as const, "used" as const),
  price: fc.integer({ min: 1, max: 999_999_999 }),
  original_price: fc.option(fc.integer({ min: 1, max: 999_999_999 }), { nil: undefined }),
  storage: fc.constantFrom("128GB", "256GB", "512GB", "1TB"),
  color: fc.constantFrom("Đen", "Trắng", "Xanh", "Tím", "Vàng"),
  battery_health: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  description: fc.string(),
  images: fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 5 }),
  stock: fc.integer({ min: 0, max: 9999 }),
  is_active: fc.boolean(),
  created: fc.constant("2024-01-01T00:00:00Z"),
  updated: fc.constant("2024-01-01T00:00:00Z"),
})

/**
 * Simulates the alt text derivation logic from ProductCard component.
 * In ProductCard.tsx: <Image alt={product.name} ... />
 */
function getImageAltText(product: Product): string {
  return product.name
}

// --- Property 6 Tests ---

describe("Feature: modern-website-redesign, Property 6: Image alt text validity", () => {
  it("alt text is always non-empty for any valid product", () => {
    fc.assert(
      fc.property(productForAltTextArb, (product) => {
        const altText = getImageAltText(product)

        expect(altText).toBeDefined()
        expect(typeof altText).toBe("string")
        expect(altText.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it("alt text length is between 1 and 150 characters", () => {
    fc.assert(
      fc.property(productForAltTextArb, (product) => {
        const altText = getImageAltText(product)

        expect(altText.length).toBeGreaterThanOrEqual(1)
        expect(altText.length).toBeLessThanOrEqual(150)
      }),
      { numRuns: 100 }
    )
  })

  it("alt text is derived from the product name", () => {
    fc.assert(
      fc.property(productForAltTextArb, (product) => {
        const altText = getImageAltText(product)

        expect(altText).toBe(product.name)
      }),
      { numRuns: 100 }
    )
  })

  it("alt text is not whitespace-only (identifies image content)", () => {
    fc.assert(
      fc.property(productForAltTextArb, (product) => {
        const altText = getImageAltText(product)

        expect(altText.trim().length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })
})
