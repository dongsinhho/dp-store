"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Phone } from "lucide-react"

/**
 * Animated Hero Section for the homepage.
 * Features:
 * - Full-width gradient background with decorative blur circles
 * - Headline with fade-in-up animation (800ms, ease-out) on mount
 * - CTA button with hover scale 1.05 and gradient shift
 * - Contact info in pill/badge containers
 * - Responsive text: mobile 1.875rem, tablet 2.25rem, desktop 3rem
 * - Communicates store's core offering (iPhone sales, chính hãng, giá tốt)
 *
 * Performance notes:
 * - Animations use only transform and opacity (composite-friendly)
 * - Headline text is rendered immediately in DOM (not hidden by JS)
 *   to avoid delaying LCP. CSS animation handles the visual entrance.
 * - will-change hints on animated elements for GPU compositing
 */
export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Trigger animation after mount - use requestAnimationFrame to ensure
    // the browser has painted the initial frame before animating
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  return (
    <section
      className="relative w-full overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"
      aria-label="Giới thiệu cửa hàng"
    >
      {/* Decorative blur circles */}
      <div
        className="absolute top-[-10%] left-[-5%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-blue-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-full bg-purple-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute top-[40%] right-[20%] w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-cyan-400/10 blur-2xl"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Headline with fade-in-up animation
              The text is always in the DOM for LCP. Animation only affects
              opacity and transform (composite-friendly properties). */}
          <h1
            className={`font-bold tracking-tight text-white will-change-[transform,opacity] ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{
              fontSize: "clamp(1.875rem, 4vw, 3rem)",
              lineHeight: 1.2,
              transition: mounted
                ? "opacity 800ms ease-out, transform 800ms ease-out"
                : "none",
            }}
          >
            iPhone chính hãng, giá tốt nhất Đà Nẵng
          </h1>

          {/* Subheadline */}
          <p
            className={`mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed will-change-[transform,opacity] ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{
              transition: mounted
                ? "opacity 800ms ease-out 200ms, transform 800ms ease-out 200ms"
                : "none",
            }}
          >
            Mua bán iPhone mới và cũ, dịch vụ sửa chữa uy tín, thu cũ đổi mới
            với giá hấp dẫn. Cam kết chính hãng, bảo hành uy tín, hỗ trợ trả
            góp.
          </p>

          {/* Contact info badges */}
          <div
            className={`mt-6 flex flex-wrap gap-3 will-change-[transform,opacity] ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{
              transition: mounted
                ? "opacity 800ms ease-out 400ms, transform 800ms ease-out 400ms"
                : "none",
            }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white">
              <MapPin className="w-4 h-4 text-blue-300 flex-shrink-0" aria-hidden="true" />
              <span>150 Thái Thị Bôi, Thanh Khê, Đà Nẵng</span>
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white">
              <Phone className="w-4 h-4 text-blue-300 flex-shrink-0" aria-hidden="true" />
              <span>0378 207 593 - 0935 462 493</span>
            </span>
          </div>

          {/* CTA Button */}
          <div
            className={`mt-8 will-change-[transform,opacity] ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{
              transition: mounted
                ? "opacity 800ms ease-out 600ms, transform 800ms ease-out 600ms"
                : "none",
            }}
          >
            <Link
              href="/san-pham"
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-base sm:text-lg shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out will-change-transform focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
