import { Cart, CartItem, Product } from "./types"

/**
 * Creates an empty cart with zero totals.
 */
export function createEmptyCart(): Cart {
  return {
    items: [],
    totalItems: 0,
    totalAmount: 0,
  }
}

/**
 * Recalculates totalItems and totalAmount from the items array.
 */
function recalculateTotals(items: CartItem[]): Cart {
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
  }
}

/**
 * Adds a product to the cart with the specified quantity.
 *
 * Preconditions:
 * - product.is_active === true
 * - product.stock >= quantity (considering existing cart quantity)
 * - quantity > 0
 *
 * If the product already exists in the cart, its quantity is incremented.
 * If the product does not exist, a new CartItem is appended.
 *
 * Returns a new Cart with recalculated totals, or the original cart if preconditions fail.
 */
export function addToCart(cart: Cart, product: Product, quantity: number): Cart {
  // Precondition: quantity must be positive
  if (quantity <= 0) {
    return cart
  }

  // Precondition: product must be active
  if (!product.is_active) {
    return cart
  }

  // Check existing quantity in cart for stock validation
  const existingItem = cart.items.find(
    (item) => item.productId === product.id
  )
  const currentQuantityInCart = existingItem ? existingItem.quantity : 0

  // Precondition: sufficient stock for the total quantity
  if (product.stock < currentQuantityInCart + quantity) {
    return cart
  }

  let updatedItems: CartItem[]

  if (existingItem) {
    // Product already in cart: increment quantity
    updatedItems = cart.items.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    )
  } else {
    // Product not in cart: append new CartItem
    const newItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0] || "",
    }
    updatedItems = [...cart.items, newItem]
  }

  return recalculateTotals(updatedItems)
}

/**
 * Removes an item from the cart by productId.
 *
 * Returns a new Cart with the item removed and recalculated totals.
 * If the productId is not found, returns the original cart unchanged.
 */
export function removeFromCart(cart: Cart, productId: string): Cart {
  const filteredItems = cart.items.filter(
    (item) => item.productId !== productId
  )

  // If nothing was removed, return original cart
  if (filteredItems.length === cart.items.length) {
    return cart
  }

  return recalculateTotals(filteredItems)
}

/**
 * Updates the quantity of a cart item.
 *
 * - If quantity is 0, the item is removed from the cart.
 * - If quantity is negative, the cart is returned unchanged.
 * - If the productId is not found, the cart is returned unchanged.
 *
 * Returns a new Cart with recalculated totals.
 */
export function updateCartQuantity(
  cart: Cart,
  productId: string,
  quantity: number
): Cart {
  // Reject negative quantities
  if (quantity < 0) {
    return cart
  }

  // If quantity is 0, remove the item
  if (quantity === 0) {
    return removeFromCart(cart, productId)
  }

  // Check if item exists in cart
  const itemExists = cart.items.some((item) => item.productId === productId)
  if (!itemExists) {
    return cart
  }

  const updatedItems = cart.items.map((item) =>
    item.productId === productId ? { ...item, quantity } : item
  )

  return recalculateTotals(updatedItems)
}

/**
 * Clears all items from the cart.
 *
 * Returns a new empty Cart with totalAmount and totalItems set to zero.
 */
export function clearCart(): Cart {
  return createEmptyCart()
}
