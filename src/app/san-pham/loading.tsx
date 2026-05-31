import { ProductGridSkeleton } from "@/components/skeletons"

/**
 * Route-level loading state for the product listing page.
 * Displays skeleton placeholders while the page data is being fetched.
 * This works alongside the Suspense boundaries in page.tsx for streaming.
 */
export default function ProductsLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="h-8 sm:h-9 bg-neutral-200 rounded w-56 animate-pulse" />
        <div className="mt-2 h-4 bg-neutral-100 rounded w-40 animate-pulse" />
      </div>
      <ProductGridSkeleton count={12} />
    </main>
  )
}
