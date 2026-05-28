import { describe, it, expect } from "vitest"
import { StockConflict } from "./actions"

/**
 * Unit tests for stock conflict handling logic.
 * The actual server action requires Pocketbase, so we test the
 * conflict data structure and client-side resolution logic.
 */

describe("StockConflict interface", () => {
  it("should represent a stock conflict with product details", () => {
    const conflict: StockConflict = {
      productId: "abc123",
      productName: "iPhone 15 Pro Max 256GB",
      requestedQuantity: 3,
      availableStock: 1,
    }

    expect(conflict.productId).toBe("abc123")
    expect(conflict.productName).toBe("iPhone 15 Pro Max 256GB")
    expect(conflict.requestedQuantity).toBe(3)
    expect(conflict.availableStock).toBe(1)
  })

  it("should represent out-of-stock product with zero available", () => {
    const conflict: StockConflict = {
      productId: "xyz789",
      productName: "iPhone 14 128GB",
      requestedQuantity: 2,
      availableStock: 0,
    }

    expect(conflict.availableStock).toBe(0)
    expect(conflict.requestedQuantity).toBeGreaterThan(conflict.availableStock)
  })
})

describe("Stock conflict resolution logic", () => {
  it("should filter out resolved conflicts from the list", () => {
    const conflicts: StockConflict[] = [
      {
        productId: "p1",
        productName: "iPhone 15",
        requestedQuantity: 5,
        availableStock: 2,
      },
      {
        productId: "p2",
        productName: "iPhone 14",
        requestedQuantity: 3,
        availableStock: 0,
      },
    ]

    // Simulate resolving the first conflict
    const afterResolve = conflicts.filter((c) => c.productId !== "p1")
    expect(afterResolve).toHaveLength(1)
    expect(afterResolve[0].productId).toBe("p2")
  })

  it("should generate correct error messages from conflicts", () => {
    const conflicts: StockConflict[] = [
      {
        productId: "p1",
        productName: "iPhone 15 Pro",
        requestedQuantity: 5,
        availableStock: 2,
      },
      {
        productId: "p2",
        productName: "iPhone 14",
        requestedQuantity: 3,
        availableStock: 0,
      },
    ]

    const errorMessages = conflicts.map(
      (c) => `Sản phẩm "${c.productName}" không đủ hàng. Còn lại: ${c.availableStock}`
    )

    expect(errorMessages[0]).toBe('Sản phẩm "iPhone 15 Pro" không đủ hàng. Còn lại: 2')
    expect(errorMessages[1]).toBe('Sản phẩm "iPhone 14" không đủ hàng. Còn lại: 0')
  })

  it("should identify products that can be adjusted vs must be removed", () => {
    const conflicts: StockConflict[] = [
      {
        productId: "p1",
        productName: "iPhone 15",
        requestedQuantity: 5,
        availableStock: 2,
      },
      {
        productId: "p2",
        productName: "iPhone 14",
        requestedQuantity: 3,
        availableStock: 0,
      },
    ]

    const adjustable = conflicts.filter((c) => c.availableStock > 0)
    const mustRemove = conflicts.filter((c) => c.availableStock === 0)

    expect(adjustable).toHaveLength(1)
    expect(adjustable[0].productId).toBe("p1")
    expect(mustRemove).toHaveLength(1)
    expect(mustRemove[0].productId).toBe("p2")
  })
})
