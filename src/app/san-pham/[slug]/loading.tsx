/**
 * Route-level loading state for the product detail page.
 * Displays skeleton placeholders while the product data is being fetched.
 */
export default function ProductDetailLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back link skeleton */}
      <div className="h-5 bg-neutral-200 rounded w-48 animate-pulse mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg bg-neutral-200 animate-pulse" />
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-md bg-neutral-200 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 bg-neutral-200 rounded w-3/4 animate-pulse" />
            <div className="h-8 bg-neutral-200 rounded w-1/2 animate-pulse" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <div className="h-8 bg-neutral-200 rounded w-36 animate-pulse" />
            <div className="h-5 bg-neutral-100 rounded w-24 animate-pulse" />
          </div>

          {/* Attributes */}
          <div className="space-y-3 border-t border-b border-gray-200 py-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-neutral-100 rounded w-20 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Add to cart button skeleton */}
          <div className="h-12 bg-neutral-200 rounded-lg animate-pulse" />

          {/* Description */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse" />
            <div className="h-4 bg-neutral-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-neutral-100 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-neutral-100 rounded w-4/6 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  )
}
