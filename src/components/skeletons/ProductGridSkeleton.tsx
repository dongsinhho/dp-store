import { ProductCardSkeleton } from "./ProductCardSkeleton"

interface ProductGridSkeletonProps {
  count: number
}

/**
 * Skeleton loading placeholder for ProductGrid.
 * Matches the responsive grid layout of the actual ProductGrid:
 * - 1 column on mobile (<640px)
 * - 2 columns on tablet (640px–1023px)
 * - 3 columns on laptop (1024px–1279px)
 * - 4 columns on desktop (1280px+)
 * - gap-4 on mobile, gap-6 on sm+
 */
export function ProductGridSkeleton({ count }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}
