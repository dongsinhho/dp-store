import { describe, it, expect, vi } from "vitest"
import * as fc from "fast-check"
import { render } from "@testing-library/react"
import ProductCard from "./ProductCard"
import { Product } from "@/lib/types"

/**
 * Property 5: Product card conditional rendering
 * Validates: Requirements 4.3, 4.5
 *
 * For any valid Product object, the ProductCard SHALL render:
 * (a) battery health percentage if and only if condition equals "used" and battery_health is defined
 * (b) an orange stock warning showing remaining count if and only if stock is between 1 and 3 inclusive
 * (c) a red "Hết hàng" label if and only if stock equals 0
 * (d) a discount badge if and only if original_price > price (both > 0)
 */

// Mock next/link to render a simple anchor
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock next/image to render a simple img
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, sizes, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

/**
 * Generator for a valid Product object with controlled properties
 * for testing conditional rendering.
 */
const productArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 15 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  slug: fc.string({ minLength: 1, maxLength: 50 }),
  category: fc.string({ minLength: 1, maxLength: 20 }),
  condition: fc.constantFrom("new" as const, "used" as const),
  price: fc.integer({ min: 1, max: 50000000 }),
  original_price: fc.oneof(
    fc.constant(undefined),
    fc.integer({ min: 0, max: 60000000 })
  ),
  storage: fc.constantFrom("64GB", "128GB", "256GB", "512GB", "1TB"),
  color: fc.constantFrom("Đen", "Trắng", "Xanh", "Đỏ", "Vàng"),
  battery_health: fc.oneof(
    fc.constant(undefined),
    fc.integer({ min: 50, max: 100 })
  ),
  description: fc.constant("Test product description"),
  images: fc.constant([] as string[]),
  stock: fc.integer({ min: 0, max: 100 }),
  is_active: fc.constant(true),
  created: fc.constant("2024-01-01T00:00:00Z"),
  updated: fc.constant("2024-01-01T00:00:00Z"),
})

describe("Property 5: Product card conditional rendering", () => {
  it("battery health tag is shown ONLY when condition === 'used' AND battery_health is not null", () => {
    fc.assert(
      fc.property(productArb, (product: Product) => {
        const { container } = render(<ProductCard product={product} />)
        const html = container.innerHTML

        const shouldShowBattery =
          product.condition === "used" && product.battery_health != null
        const hasBatteryTag = html.includes(`Pin ${product.battery_health}%`)

        if (shouldShowBattery) {
          expect(hasBatteryTag).toBe(true)
        } else {
          // When condition is "new" or battery_health is null/undefined,
          // no battery health tag should appear
          const anyBatteryMention = /Pin \d+%/.test(html)
          expect(anyBatteryMention).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })

  it("stock warning (orange) is shown ONLY when stock is between 1 and 3 inclusive", () => {
    fc.assert(
      fc.property(productArb, (product: Product) => {
        const { container } = render(<ProductCard product={product} />)
        const html = container.innerHTML

        const shouldShowStockWarning = product.stock >= 1 && product.stock <= 3
        const hasStockWarning = html.includes(
          `Chỉ còn ${product.stock} sản phẩm`
        )

        if (shouldShowStockWarning) {
          expect(hasStockWarning).toBe(true)
        } else {
          // No stock warning text should appear for stock > 3 or stock === 0
          const anyStockWarning = /Chỉ còn \d+ sản phẩm/.test(html)
          expect(anyStockWarning).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('"Hết hàng" (red) is shown ONLY when stock === 0', () => {
    fc.assert(
      fc.property(productArb, (product: Product) => {
        const { container } = render(<ProductCard product={product} />)
        const html = container.innerHTML

        const shouldShowOutOfStock = product.stock === 0
        const hasOutOfStock = html.includes("Hết hàng")

        expect(hasOutOfStock).toBe(shouldShowOutOfStock)
      }),
      { numRuns: 100 }
    )
  })

  it("discount badge is shown ONLY when original_price > price (both > 0)", () => {
    fc.assert(
      fc.property(productArb, (product: Product) => {
        const { container } = render(<ProductCard product={product} />)
        const html = container.innerHTML

        const shouldShowDiscount =
          product.original_price != null &&
          product.original_price > product.price &&
          product.price > 0

        // The discount badge contains a percentage like "-15%"
        const hasDiscountBadge = /-%\d*/.test(html) || /-\d+%/.test(html)

        if (shouldShowDiscount) {
          expect(hasDiscountBadge).toBe(true)
        } else {
          expect(hasDiscountBadge).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })
})
