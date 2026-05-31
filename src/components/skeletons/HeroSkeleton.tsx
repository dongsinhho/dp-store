/**
 * Skeleton loading placeholder for HeroSection.
 * Matches the dimensions of the actual HeroSection to prevent layout shift:
 * - Full-width gradient background
 * - Headline placeholder
 * - Subtext placeholder
 * - Contact badges placeholder
 * - CTA button placeholder
 * - Same padding: py-16 sm:py-24 lg:py-32
 */
export function HeroSkeleton() {
  return (
    <section
      className="relative w-full overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 animate-pulse"
      aria-label="Đang tải..."
      aria-busy="true"
    >
      {/* Content matching HeroSection padding */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Headline placeholder */}
          <div className="space-y-3">
            <div className="h-9 sm:h-10 lg:h-12 bg-white/10 rounded-lg w-full max-w-xl" />
            <div className="h-9 sm:h-10 lg:h-12 bg-white/10 rounded-lg w-3/4 max-w-md" />
          </div>

          {/* Subheadline placeholder */}
          <div className="mt-4 sm:mt-6 space-y-2">
            <div className="h-5 bg-white/10 rounded w-full max-w-lg" />
            <div className="h-5 bg-white/10 rounded w-5/6 max-w-md" />
            <div className="h-5 bg-white/10 rounded w-2/3 max-w-sm" />
          </div>

          {/* Contact badges placeholder */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="h-10 bg-white/10 rounded-full w-64" />
            <div className="h-10 bg-white/10 rounded-full w-52" />
          </div>

          {/* CTA Button placeholder */}
          <div className="mt-8">
            <div className="h-12 bg-white/10 rounded-lg w-40" />
          </div>
        </div>
      </div>
    </section>
  )
}
