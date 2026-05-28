"use client"

import { useState, useEffect, useCallback } from "react"
import { Cart, Product } from "@/lib/types"
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  createEmptyCart,
} from "@/lib/cart"

const CART_STORAGE_KEY = "dp-store-cart"

/**
 * Attempts to load cart data from localStorage.
 * Returns an empty cart if data is missing, invalid JSON, or doesn't match expected shape.
 */
function loadCartFromStorage(): Cart {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) {
      return createEmptyCart()
    }

    const parsed = JSON.parse(stored)

    // Validate the parsed data has the expected Cart shape
    if (
      parsed &&
      Array.isArray(parsed.items) &&
      typeof parsed.totalItems === "number" &&
      typeof parsed.totalAmount === "number"
    ) {
      return parsed as Cart
    }

    return createEmptyCart()
  } catch {
    return createEmptyCart()
  }
}

/**
 * Saves cart state to localStorage.
 */
function saveCartToStorage(cart: Cart): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

/**
 * Client-side hook for managing shopping cart state with localStorage persistence.
 *
 * Loads cart from localStorage on mount, saves on every change.
 * Handles invalid/missing localStorage data gracefully by initializing an empty cart.
 */
export function useCart() {
  const [cart, setCart] = useState<Cart>(createEmptyCart)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = loadCartFromStorage()
    setCart(storedCart)
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage on every change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveCartToStorage(cart)
    }
  }, [cart, isLoaded])

  const add = useCallback((product: Product, quantity: number = 1) => {
    setCart((prev) => addToCart(prev, product, quantity))
  }, [])

  const remove = useCallback((productId: string) => {
    setCart((prev) => removeFromCart(prev, productId))
  }, [])

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCart((prev) => updateCartQuantity(prev, productId, quantity))
    },
    []
  )

  const clear = useCallback(() => {
    setCart(clearCart())
  }, [])

  return { cart, add, remove, updateQuantity, clear }
}
