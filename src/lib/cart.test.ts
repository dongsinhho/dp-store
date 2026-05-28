import { describe, it, expect } from "vitest"
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  createEmptyCart,
} from "./cart"
import { Product } from "./types"

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    name: "iPhone 15 Pro Max 256GB",
    slug: "iphone-15-pro-max-256gb",
    category: "cat-1",
    condition: "new",
    price: 30000000,
    storage: "256GB",
    color: "Đen",
    description: "iPhone 15 Pro Max mới",
    images: ["image1.jpg"],
    stock: 10,
    is_active: true,
    created: "2024-01-01",
    updated: "2024-01-01",
    ...overrides,
  }
}

describe("createEmptyCart", () => {
  it("returns a cart with empty items and zero totals", () => {
    const cart = createEmptyCart()
    expect(cart.items).toEqual([])
    expect(cart.totalItems).toBe(0)
    expect(cart.totalAmount).toBe(0)
  })
})

describe("addToCart", () => {
  it("adds a new product to an empty cart", () => {
    const cart = createEmptyCart()
    const product = createMockProduct()

    const result = addToCart(cart, product, 1)

    expect(result.items).toHaveLength(1)
    expect(result.items[0].productId).toBe("prod-1")
    expect(result.items[0].name).toBe("iPhone 15 Pro Max 256GB")
    expect(result.items[0].price).toBe(30000000)
    expect(result.items[0].quantity).toBe(1)
    expect(result.items[0].image).toBe("image1.jpg")
    expect(result.totalItems).toBe(1)
    expect(result.totalAmount).toBe(30000000)
  })

  it("increments quantity when product already exists in cart", () => {
    const product = createMockProduct()
    let cart = createEmptyCart()
    cart = addToCart(cart, product, 2)

    const result = addToCart(cart, product, 3)

    expect(result.items).toHaveLength(1)
    expect(result.items[0].quantity).toBe(5)
    expect(result.totalItems).toBe(5)
    expect(result.totalAmount).toBe(150000000)
  })

  it("adds multiple different products", () => {
    const product1 = createMockProduct({ id: "prod-1", price: 30000000 })
    const product2 = createMockProduct({
      id: "prod-2",
      name: "iPhone 14",
      price: 20000000,
    })
    let cart = createEmptyCart()

    cart = addToCart(cart, product1, 1)
    cart = addToCart(cart, product2, 2)

    expect(cart.items).toHaveLength(2)
    expect(cart.totalItems).toBe(3)
    expect(cart.totalAmount).toBe(70000000)
  })

  it("rejects addition when product is inactive", () => {
    const cart = createEmptyCart()
    const product = createMockProduct({ is_active: false })

    const result = addToCart(cart, product, 1)

    expect(result).toBe(cart)
    expect(result.items).toHaveLength(0)
  })

  it("rejects addition when quantity is zero", () => {
    const cart = createEmptyCart()
    const product = createMockProduct()

    const result = addToCart(cart, product, 0)

    expect(result).toBe(cart)
  })

  it("rejects addition when quantity is negative", () => {
    const cart = createEmptyCart()
    const product = createMockProduct()

    const result = addToCart(cart, product, -1)

    expect(result).toBe(cart)
  })

  it("rejects addition when stock is insufficient", () => {
    const cart = createEmptyCart()
    const product = createMockProduct({ stock: 2 })

    const result = addToCart(cart, product, 3)

    expect(result).toBe(cart)
  })

  it("rejects addition when combined quantity exceeds stock", () => {
    const product = createMockProduct({ stock: 5 })
    let cart = createEmptyCart()
    cart = addToCart(cart, product, 3)

    const result = addToCart(cart, product, 3)

    // 3 + 3 = 6 > 5 stock, should reject
    expect(result).toBe(cart)
    expect(result.items[0].quantity).toBe(3)
  })

  it("handles product with empty images array", () => {
    const cart = createEmptyCart()
    const product = createMockProduct({ images: [] })

    const result = addToCart(cart, product, 1)

    expect(result.items[0].image).toBe("")
  })
})

describe("removeFromCart", () => {
  it("removes an existing item from the cart", () => {
    const product = createMockProduct()
    let cart = createEmptyCart()
    cart = addToCart(cart, product, 2)

    const result = removeFromCart(cart, "prod-1")

    expect(result.items).toHaveLength(0)
    expect(result.totalItems).toBe(0)
    expect(result.totalAmount).toBe(0)
  })

  it("returns original cart when productId not found", () => {
    const product = createMockProduct()
    let cart = createEmptyCart()
    cart = addToCart(cart, product, 1)

    const result = removeFromCart(cart, "non-existent")

    expect(result).toBe(cart)
  })

  it("recalculates totals after removal", () => {
    const product1 = createMockProduct({ id: "prod-1", price: 30000000 })
    const product2 = createMockProduct({
      id: "prod-2",
      name: "iPhone 14",
      price: 20000000,
    })
    let cart = createEmptyCart()
    cart = addToCart(cart, product1, 1)
    cart = addToCart(cart, product2, 2)

    const result = removeFromCart(cart, "prod-1")

    expect(result.items).toHaveLength(1)
    expect(result.totalItems).toBe(2)
    expect(result.totalAmount).toBe(40000000)
  })
})

describe("updateCartQuantity", () => {
  it("updates quantity of an existing item", () => {
    const product = createMockProduct()
    let cart = createEmptyCart()
    cart = addToCart(cart, product, 1)

    const result = updateCartQuantity(cart, "prod-1", 5)

    expect(result.items[0].quantity).toBe(5)
    expect(result.totalItems).toBe(5)
    expect(result.totalAmount).toBe(150000000)
  })

  it("removes item when quantity is set to zero", () => {
    const product = createMockProduct()
    let cart = createEmptyCart()
    cart = addToCart(cart, product, 3)

    const result = updateCartQuantity(cart, "prod-1", 0)

    expect(result.items).toHaveLength(0)
    expect(result.totalItems).toBe(0)
    expect(result.totalAmount).toBe(0)
  })

  it("returns original cart for negative quantity", () => {
    const product = createMockProduct()
    let cart = createEmptyCart()
    cart = addToCart(cart, product, 2)

    const result = updateCartQuantity(cart, "prod-1", -1)

    expect(result).toBe(cart)
  })

  it("returns original cart when productId not found", () => {
    const product = createMockProduct()
    let cart = createEmptyCart()
    cart = addToCart(cart, product, 1)

    const result = updateCartQuantity(cart, "non-existent", 5)

    expect(result).toBe(cart)
  })

  it("recalculates totals correctly with multiple items", () => {
    const product1 = createMockProduct({ id: "prod-1", price: 30000000 })
    const product2 = createMockProduct({
      id: "prod-2",
      name: "iPhone 14",
      price: 20000000,
    })
    let cart = createEmptyCart()
    cart = addToCart(cart, product1, 1)
    cart = addToCart(cart, product2, 1)

    const result = updateCartQuantity(cart, "prod-2", 3)

    expect(result.totalItems).toBe(4)
    expect(result.totalAmount).toBe(90000000)
  })
})

describe("clearCart", () => {
  it("returns an empty cart", () => {
    const result = clearCart()

    expect(result.items).toEqual([])
    expect(result.totalItems).toBe(0)
    expect(result.totalAmount).toBe(0)
  })
})
