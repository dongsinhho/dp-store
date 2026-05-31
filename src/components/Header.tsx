"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useCart } from "@/hooks/useCart"

const navLinks = [
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/sua-chua", label: "Sửa chữa" },
  { href: "/thu-cu-doi-moi", label: "Thu cũ đổi mới" },
]

/**
 * Formats the cart badge display text.
 * - Returns null if count is 0 (badge hidden)
 * - Returns the numeric string for 1-99
 * - Returns "99+" for counts exceeding 99
 */
function getCartBadgeText(count: number): string | null {
  if (count <= 0) return null
  if (count > 99) return "99+"
  return String(count)
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { cart } = useCart()

  const menuPanelRef = useRef<HTMLDivElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Track scroll position for glassmorphism effect
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0)
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu function
  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false)
    // Return focus to the toggle button when menu closes
    menuToggleRef.current?.focus()
  }, [])

  // Escape key support
  useEffect(() => {
    if (!mobileMenuOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mobileMenuOpen, closeMenu])

  // Focus trap when menu is open
  useEffect(() => {
    if (!mobileMenuOpen || !menuPanelRef.current) return

    const panel = menuPanelRef.current
    const focusableSelectors = 'a[href], button, [tabindex]:not([tabindex="-1"])'
    const focusableElements = panel.querySelectorAll<HTMLElement>(focusableSelectors)

    if (focusableElements.length === 0) return

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    // Focus the close button when menu opens
    closeButtonRef.current?.focus()

    function handleTabTrap(e: KeyboardEvent) {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    document.addEventListener("keydown", handleTabTrap)
    return () => document.removeEventListener("keydown", handleTabTrap)
  }, [mobileMenuOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const badgeText = getCartBadgeText(cart.totalItems)

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${
          scrolled
            ? "backdrop-blur-lg bg-white/80 shadow-medium"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                Đình Phong Store
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-gray-700 hover:text-primary font-medium transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
                </Link>
              ))}
            </nav>

            {/* Cart Icon + Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {/* Cart Icon with Badge */}
              <Link
                href="/gio-hang"
                className="relative p-2 text-gray-700 hover:text-primary transition-colors duration-200"
                aria-label={`Giỏ hàng, ${cart.totalItems} sản phẩm`}
              >
                <ShoppingCart className="w-6 h-6" aria-hidden="true" />
                {badgeText && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1" aria-hidden="true">
                    {badgeText}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                ref={menuToggleRef}
                type="button"
                className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu-panel"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Menu Overlay + Panel */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop overlay - closes menu on tap */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Slide-in panel from right */}
        <div
          ref={menuPanelRef}
          id="mobile-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
          className={`absolute top-0 right-0 h-full w-72 max-w-[80vw] bg-white shadow-elevated transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel header with close button */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Menu</span>
            <button
              ref={closeButtonRef}
              type="button"
              className="p-2 text-gray-700 hover:text-primary transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={closeMenu}
              aria-label="Đóng menu"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation links */}
          <nav aria-label="Menu điều hướng di động" className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart link in mobile menu */}
          <div className="px-4 pt-2 border-t border-gray-200">
            <Link
              href="/gio-hang"
              className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={closeMenu}
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              <span>Giỏ hàng</span>
              {badgeText && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1" aria-hidden="true">
                  {badgeText}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export { getCartBadgeText }
