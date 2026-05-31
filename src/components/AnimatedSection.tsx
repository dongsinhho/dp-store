"use client"

import { useScrollAnimation } from "@/hooks/useScrollAnimation"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number // stagger delay in ms (default 0)
}

/**
 * Wrapper component that applies a fade-in-up animation when the section
 * scrolls into the viewport. Uses the useScrollAnimation hook with
 * IntersectionObserver for performant scroll-triggered animations.
 *
 * Supports staggered animations via the `delay` prop.
 * Respects `prefers-reduced-motion` preference automatically via the hook.
 */
export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`${isVisible ? "animate-fade-in-up" : "opacity-0"} ${className}`}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
