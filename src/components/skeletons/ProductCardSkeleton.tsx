/**
 * Skeleton loading placeholder for ProductCard.
 * Matches the dimensions of the actual ProductCard to prevent layout shift:
 * - Square aspect-ratio image container with rounded top corners
 * - 2-line product name placeholder
 * - Price line
 * - Attribute tags row
 * - Stock warning line
 */
export function ProductCardSkeleton() {
  return (
    <div className="block rounded-[8px] bg-white overflow-hidden shadow-subtle animate-pulse">
      {/* Image Container - Square aspect ratio matching ProductCard */}
      <div className="aspect-square rounded-t-[8px] bg-neutral-200" />

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Product Name - 2 lines */}
        <div className="space-y-1.5 min-h-[2.5rem]">
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>

        {/* Price Section */}
        <div className="mt-2 flex items-baseline gap-2">
          <div className="h-5 bg-neutral-200 rounded w-28" />
          <div className="h-3.5 bg-neutral-100 rounded w-20" />
        </div>

        {/* Attribute Tags - Storage, Color */}
        <div className="mt-2 flex flex-wrap gap-1">
          <div className="h-5 bg-neutral-100 rounded-sm w-14" />
          <div className="h-5 bg-neutral-100 rounded-sm w-16" />
        </div>

        {/* Stock Warning placeholder */}
        <div className="mt-2 h-4 bg-neutral-100 rounded w-32" />
      </div>
    </div>
  )
}
