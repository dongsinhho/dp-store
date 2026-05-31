"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface UseScrollAnimationOptions {
  threshold?: number // default 0.1 (10%)
  rootMargin?: string // default '0px'
  triggerOnce?: boolean // default true
}

/**
 * Custom hook for scroll-triggered animations via IntersectionObserver.
 *
 * Returns a ref to attach to the target element and an isVisible boolean
 * that becomes true when the element enters the viewport.
 *
 * Respects `prefers-reduced-motion: reduce` by returning isVisible: true immediately.
 * Falls back to isVisible: true if IntersectionObserver is unavailable.
 */
export function useScrollAnimation(
  options?: UseScrollAnimationOptions
): {
  ref: (node: HTMLElement | null) => void
  isVisible: boolean
} {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } =
    options ?? {}

  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  // Check for reduced motion preference and IO availability once on mount
  const [shouldSkipAnimation, setShouldSkipAnimation] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setIsVisible(true)
      setShouldSkipAnimation(true)
    }
  }, [])

  // Cleanup observer on unmount or when options change
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  const ref = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      elementRef.current = node

      // Skip if no node
      if (!node) {
        return
      }

      // Check reduced motion preference synchronously
      if (
        shouldSkipAnimation ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      ) {
        setIsVisible(true)
        return
      }

      // Check IO availability
      if (typeof IntersectionObserver === "undefined") {
        setIsVisible(true)
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setIsVisible(true)
              if (triggerOnce) {
                observer.unobserve(entry.target)
              }
            } else if (!triggerOnce) {
              setIsVisible(false)
            }
          }
        },
        { threshold, rootMargin }
      )

      observer.observe(node)
      observerRef.current = observer
    },
    [shouldSkipAnimation, threshold, rootMargin, triggerOnce]
  )

  return { ref, isVisible }
}
