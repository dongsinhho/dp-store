import { createServerPb } from "@/lib/pocketbase"
import { Product } from "@/lib/types"

export interface ProductFilters {
  page?: number
  category?: string
  condition?: "new" | "used"
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: string
}

export interface ProductListResult {
  items: Product[]
  page: number
  perPage: number
  totalItems: number
  totalPages: number
}

const DEFAULT_PER_PAGE = 12

/**
 * Builds a PocketBase filter string from the given product filters.
 * Always includes `is_active = true` as the base filter.
 * This function is exported for testability.
 */
export function buildProductFilter(options: ProductFilters = {}): string {
  const filterParts: string[] = ["is_active = true"]

  if (options.category) {
    filterParts.push(`category = "${options.category}"`)
  }

  if (options.condition) {
    filterParts.push(`condition = "${options.condition}"`)
  }

  if (options.minPrice !== undefined && options.minPrice !== null) {
    filterParts.push(`price >= ${options.minPrice}`)
  }

  if (options.maxPrice !== undefined && options.maxPrice !== null) {
    filterParts.push(`price <= ${options.maxPrice}`)
  }

  if (options.search) {
    const searchEscaped = options.search.replace(/"/g, '\\"')
    filterParts.push(
      `(name ~ "${searchEscaped}" || description ~ "${searchEscaped}")`
    )
  }

  return filterParts.join(" && ")
}

/**
 * Fetch paginated products with optional filters.
 * Always filters by is_active = true.
 */
export async function getProducts(
  options: ProductFilters = {}
): Promise<ProductListResult> {
  const pb = createServerPb()
  const page = options.page ?? 1
  const perPage = DEFAULT_PER_PAGE

  const filter = buildProductFilter(options)
  const sort = options.sort ?? "-created"

  try {
    const result = await pb.collection("products").getList(page, perPage, {
      filter,
      sort,
      expand: "category",
    })

    return {
      items: result.items as unknown as Product[],
      page: result.page,
      perPage: result.perPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    }
  } catch (error) {
    console.error("Failed to fetch products:", error)
    // Return empty result instead of crashing the page
    return {
      items: [],
      page: 1,
      perPage,
      totalItems: 0,
      totalPages: 0,
    }
  }
}

/**
 * Fetch a single product by its slug.
 * Only returns active products.
 */
export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const pb = createServerPb()

  try {
    const record = await pb
      .collection("products")
      .getFirstListItem(`slug = "${slug}" && is_active = true`, {
        expand: "category",
      })

    return record as unknown as Product
  } catch {
    // PocketBase throws ClientResponseError when no record is found
    return null
  }
}
