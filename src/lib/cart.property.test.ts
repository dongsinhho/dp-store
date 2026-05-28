import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  createEmptyCart,
} from "./cart"
import { Cart, Product } from "./types"

// --- Generators ---

/**
 * Generates a valid active Product with reasonable values.
 */
const productArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  slug: fc.string({ minLength: 1, maxLength: 50 }),
  category: fc.string({ minLength: 1 }),
  condition: fc.constantFrom("new" as const, "used" as const),
  price: fc.integer({ min: 1, max: 999_999_999 }),
  storage: fc.constantFrom("128GB", "256GB", "512GB", "1TB"),
  color: fc.string({ minLength: 1 }),
  description: fc.string(),
  images: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
  stock: fc.integer({ min: 1, max: 9999 }),
  is_active: fc.constant(true),
  created: fc.constant("2024-01-01T00:00:00Z"),
  updated: fc.constant("2024-01-01T00:00:00Z"),
}) as fc.Arbitrary<Product>

/**
 * Generates a quantity that is valid for adding to cart (positive, within stock).
 */
function quantityForProduct(product: Product): fc.Arbitrary<number> {
  return fc.integer({ min: 1, max: product.stock })
}

/**
 * Represents a cart operation that can be applied sequentially.
 */
type CartOperation =
  | { type: "add"; product: Product; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "update"; productId: string; quantity: number }
  | { type: "clear" }

/**
 * Generates a sequence of cart operations using a set of products.
 */
function cartOperationsArb(
  products: Product[]
): fc.Arbitrary<CartOperation[]> {
  const addOp = fc
    .integer({ min: 0, max: products.length - 1 })
    .chain((idx) => {
      const product = products[idx]
      return fc.integer({ min: 1, max: Math.min(product.stock, 5) }).map(
        (quantity): CartOperation => ({
          type: "add",
          product,
          quantity,
        })
      )
    })

  const removeOp = fc
    .integer({ min: 0, max: products.length - 1 })
    .map((idx): CartOperation => ({
      type: "remove",
      productId: products[idx].id,
    }))

  const updateOp = fc
    .integer({ min: 0, max: products.length - 1 })
    .chain((idx) =>
      fc.integer({ min: 0, max: 10 }).map(
        (quantity): CartOperation => ({
          type: "update",
          productId: products[idx].id,
          quantity,
        })
      )
    )

  const clearOp = fc.constant<CartOperation>({ type: "clear" })

  return fc.array(fc.oneof(addOp, removeOp, updateOp, clearOp), {
    minLength: 1,
    maxLength: 20,
  })
}

/**
 * Applies a sequence of operations to a cart and returns the final cart.
 */
function applyOperations(cart: Cart, operations: CartOperation[]): Cart {
  let current = cart
  for (const op of operations) {
    switch (op.type) {
      case "add":
        current = addToCart(current, op.product, op.quantity)
        break
      case "remove":
        current = removeFromCart(current, op.productId)
        break
      case "update":
        current = updateCartQuantity(current, op.productId, op.quantity)
        break
      case "clear":
        current = clearCart()
        break
    }
  }
  return current
}

// --- Property Tests ---

/**
 * Property 1: Cart total consistency
 * Validates: Requirements 2.4, 2.5, 2.6, 2.7, 2.8
 *
 * For any Cart state resulting from any sequence of add, remove, update, or clear
 * operations, the Cart totalAmount SHALL equal the sum of (price × quantity) for
 * all items, and the Cart totalItems SHALL equal the sum of all item quantities.
 */
describe("Property 1: Cart total consistency", () => {
  it("totalAmount equals sum of (price * quantity) for all items after any sequence of operations", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 5 }).chain(
          (products) =>
            cartOperationsArb(products).map((ops) => ({ products, ops }))
        ),
        ({ ops }) => {
          const cart = applyOperations(createEmptyCart(), ops)

          const expectedTotalAmount = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )

          expect(cart.totalAmount).toBe(expectedTotalAmount)
        }
      ),
      { numRuns: 1000 }
    )
  })

  it("totalItems equals sum of all item quantities after any sequence of operations", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 5 }).chain(
          (products) =>
            cartOperationsArb(products).map((ops) => ({ products, ops }))
        ),
        ({ ops }) => {
          const cart = applyOperations(createEmptyCart(), ops)

          const expectedTotalItems = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          )

          expect(cart.totalItems).toBe(expectedTotalItems)
        }
      ),
      { numRuns: 1000 }
    )
  })

  it("clearCart always results in zero totals", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 5 }).chain(
          (products) =>
            cartOperationsArb(products).map((ops) => ({ products, ops }))
        ),
        ({ ops }) => {
          applyOperations(createEmptyCart(), ops)
          const cartAfterClear = clearCart()

          expect(cartAfterClear.totalAmount).toBe(0)
          expect(cartAfterClear.totalItems).toBe(0)
          expect(cartAfterClear.items).toHaveLength(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Property 2: Add to cart guarantees presence
 * Validates: Requirements 2.1, 2.2, 2.3
 *
 * For any valid Product and positive quantity, after calling addToCart, the resulting
 * Cart SHALL contain an item with the matching productId, and if the product already
 * existed in the Cart, its quantity SHALL have increased by the specified amount.
 */
describe("Property 2: Add to cart guarantees presence", () => {
  it("after adding a valid product, the product is present in the cart", () => {
    fc.assert(
      fc.property(
        productArb.chain((product) =>
          quantityForProduct(product).map((quantity) => ({ product, quantity }))
        ),
        ({ product, quantity }) => {
          const cart = createEmptyCart()
          const result = addToCart(cart, product, quantity)

          const item = result.items.find(
            (i) => i.productId === product.id
          )
          expect(item).toBeDefined()
          expect(item!.productId).toBe(product.id)
          expect(item!.quantity).toBe(quantity)
          expect(item!.price).toBe(product.price)
          expect(item!.name).toBe(product.name)
        }
      ),
      { numRuns: 1000 }
    )
  })

  it("adding a product that already exists increments its quantity", () => {
    fc.assert(
      fc.property(
        productArb
          .filter((p) => p.stock >= 2)
          .chain((product) => {
            const maxFirst = Math.floor(product.stock / 2)
            return fc
              .integer({ min: 1, max: Math.max(1, maxFirst) })
              .chain((firstQty) =>
                fc
                  .integer({
                    min: 1,
                    max: Math.max(1, product.stock - firstQty),
                  })
                  .map((secondQty) => ({ product, firstQty, secondQty }))
              )
          }),
        ({ product, firstQty, secondQty }) => {
          const cart = createEmptyCart()
          const afterFirst = addToCart(cart, product, firstQty)
          const afterSecond = addToCart(afterFirst, product, secondQty)

          const item = afterSecond.items.find(
            (i) => i.productId === product.id
          )
          expect(item).toBeDefined()
          expect(item!.quantity).toBe(firstQty + secondQty)
        }
      ),
      { numRuns: 1000 }
    )
  })

  it("adding an inactive product does not modify the cart", () => {
    const inactiveProductArb = productArb.map((p) => ({
      ...p,
      is_active: false,
    }))

    fc.assert(
      fc.property(
        inactiveProductArb,
        fc.integer({ min: 1, max: 10 }),
        (product, quantity) => {
          const cart = createEmptyCart()
          const result = addToCart(cart, product, quantity)

          expect(result).toBe(cart)
          expect(result.items).toHaveLength(0)
        }
      ),
      { numRuns: 500 }
    )
  })

  it("adding with quantity exceeding stock does not modify the cart", () => {
    fc.assert(
      fc.property(
        productArb.chain((product) =>
          fc
            .integer({ min: product.stock + 1, max: product.stock + 100 })
            .map((quantity) => ({ product, quantity }))
        ),
        ({ product, quantity }) => {
          const cart = createEmptyCart()
          const result = addToCart(cart, product, quantity)

          expect(result).toBe(cart)
          expect(result.items).toHaveLength(0)
        }
      ),
      { numRuns: 500 }
    )
  })
})
