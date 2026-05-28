import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"
import { useCart } from "./useCart"
import { Product, Cart } from "@/lib/types"

const CART_STORAGE_KEY = "dp-store-cart"

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    name: "iPhone 15 Pro Max 256GB",
    slug: "iphone-15-pro-max-256gb",
    category: "iphone-15",
    condition: "new",
    price: 30000000,
    storage: "256GB",
    color: "Black",
    description: "Brand new iPhone 15 Pro Max",
    images: ["image1.jpg", "image2.jpg"],
    stock: 10,
    is_active: true,
    created: "2024-01-01",
    updated: "2024-01-01",
    ...overrides,
  }
}

describe("useCart", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("initializes with an empty cart", () => {
    const { result } = renderHook(() => useCart())

    expect(result.current.cart.items).toEqual([])
    expect(result.current.cart.totalItems).toBe(0)
    expect(result.current.cart.totalAmount).toBe(0)
  })

  it("loads cart from localStorage on mount", () => {
    const savedCart: Cart = {
      items: [
        {
          productId: "prod-1",
          name: "iPhone 15",
          price: 25000000,
          quantity: 2,
          image: "img.jpg",
        },
      ],
      totalItems: 2,
      totalAmount: 50000000,
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(savedCart))

    const { result } = renderHook(() => useCart())

    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0].productId).toBe("prod-1")
    expect(result.current.cart.totalItems).toBe(2)
    expect(result.current.cart.totalAmount).toBe(50000000)
  })

  it("initializes empty cart when localStorage has invalid JSON", () => {
    localStorage.setItem(CART_STORAGE_KEY, "not valid json{{{")

    const { result } = renderHook(() => useCart())

    expect(result.current.cart.items).toEqual([])
    expect(result.current.cart.totalItems).toBe(0)
    expect(result.current.cart.totalAmount).toBe(0)
  })

  it("initializes empty cart when localStorage has wrong shape", () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ foo: "bar" }))

    const { result } = renderHook(() => useCart())

    expect(result.current.cart.items).toEqual([])
    expect(result.current.cart.totalItems).toBe(0)
    expect(result.current.cart.totalAmount).toBe(0)
  })

  it("adds a product to the cart", () => {
    const { result } = renderHook(() => useCart())
    const product = createMockProduct()

    act(() => {
      result.current.add(product, 1)
    })

    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0].productId).toBe("prod-1")
    expect(result.current.cart.items[0].quantity).toBe(1)
    expect(result.current.cart.totalItems).toBe(1)
    expect(result.current.cart.totalAmount).toBe(30000000)
  })

  it("increments quantity when adding existing product", () => {
    const { result } = renderHook(() => useCart())
    const product = createMockProduct()

    act(() => {
      result.current.add(product, 1)
    })
    act(() => {
      result.current.add(product, 2)
    })

    expect(result.current.cart.items).toHaveLength(1)
    expect(result.current.cart.items[0].quantity).toBe(3)
    expect(result.current.cart.totalItems).toBe(3)
    expect(result.current.cart.totalAmount).toBe(90000000)
  })

  it("removes a product from the cart", () => {
    const { result } = renderHook(() => useCart())
    const product = createMockProduct()

    act(() => {
      result.current.add(product, 2)
    })
    act(() => {
      result.current.remove("prod-1")
    })

    expect(result.current.cart.items).toEqual([])
    expect(result.current.cart.totalItems).toBe(0)
    expect(result.current.cart.totalAmount).toBe(0)
  })

  it("updates quantity of a cart item", () => {
    const { result } = renderHook(() => useCart())
    const product = createMockProduct()

    act(() => {
      result.current.add(product, 1)
    })
    act(() => {
      result.current.updateQuantity("prod-1", 5)
    })

    expect(result.current.cart.items[0].quantity).toBe(5)
    expect(result.current.cart.totalItems).toBe(5)
    expect(result.current.cart.totalAmount).toBe(150000000)
  })

  it("clears the cart", () => {
    const { result } = renderHook(() => useCart())
    const product = createMockProduct()

    act(() => {
      result.current.add(product, 3)
    })
    act(() => {
      result.current.clear()
    })

    expect(result.current.cart.items).toEqual([])
    expect(result.current.cart.totalItems).toBe(0)
    expect(result.current.cart.totalAmount).toBe(0)
  })

  it("persists cart to localStorage on change", () => {
    const { result } = renderHook(() => useCart())
    const product = createMockProduct()

    act(() => {
      result.current.add(product, 1)
    })

    const stored = localStorage.getItem(CART_STORAGE_KEY)
    expect(stored).not.toBeNull()

    const parsed = JSON.parse(stored!)
    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0].productId).toBe("prod-1")
    expect(parsed.totalItems).toBe(1)
    expect(parsed.totalAmount).toBe(30000000)
  })

  it("does not add inactive product", () => {
    const { result } = renderHook(() => useCart())
    const product = createMockProduct({ is_active: false })

    act(() => {
      result.current.add(product, 1)
    })

    expect(result.current.cart.items).toEqual([])
    expect(result.current.cart.totalItems).toBe(0)
  })

  it("does not add product with insufficient stock", () => {
    const { result } = renderHook(() => useCart())
    const product = createMockProduct({ stock: 2 })

    act(() => {
      result.current.add(product, 5)
    })

    expect(result.current.cart.items).toEqual([])
    expect(result.current.cart.totalItems).toBe(0)
  })
})
