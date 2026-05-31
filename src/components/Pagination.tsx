import Link from "next/link"

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string | undefined>
}

/**
 * Build a URL with updated page parameter while preserving other search params.
 */
function buildPageUrl(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams()

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") {
        params.set(key, value)
      }
    }
  }

  if (page > 1) {
    params.set("page", String(page))
  }

  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  // Generate page numbers to display
  const pages: (number | "ellipsis")[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible + 2) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    if (start > 2) {
      pages.push("ellipsis")
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis")
    }

    // Always show last page
    pages.push(totalPages)
  }

  return (
    <nav aria-label="Phân trang" className="flex justify-center mt-8">
      <ul className="flex items-center gap-2">
        {/* Previous button */}
        <li>
          {currentPage > 1 ? (
            <Link
              href={buildPageUrl(basePath, currentPage - 1, searchParams)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] bg-white hover:bg-[var(--color-neutral-50)] hover:border-[var(--color-neutral-300)] hover:shadow-[var(--shadow-subtle)] transition-all duration-200"
              aria-label="Trang trước"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          ) : (
            <span
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-neutral-100)] text-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] cursor-not-allowed"
              aria-disabled="true"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </span>
          )}
        </li>

        {/* Page numbers */}
        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="flex items-center justify-center w-10 h-10 text-[var(--color-neutral-400)] text-sm">
                  …
                </span>
              </li>
            )
          }

          const isActive = page === currentPage

          return (
            <li key={page}>
              {isActive ? (
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm shadow-[var(--shadow-medium)]"
                  aria-current="page"
                >
                  {page}
                </span>
              ) : (
                <Link
                  href={buildPageUrl(basePath, page, searchParams)}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] bg-white hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] transition-all duration-200 text-sm font-medium"
                >
                  {page}
                </Link>
              )}
            </li>
          )
        })}

        {/* Next button */}
        <li>
          {currentPage < totalPages ? (
            <Link
              href={buildPageUrl(basePath, currentPage + 1, searchParams)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] bg-white hover:bg-[var(--color-neutral-50)] hover:border-[var(--color-neutral-300)] hover:shadow-[var(--shadow-subtle)] transition-all duration-200"
              aria-label="Trang sau"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ) : (
            <span
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-neutral-100)] text-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] cursor-not-allowed"
              aria-disabled="true"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
