import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { buildProductFilter, ProductFilters } from "./products"

// --- Generators ---

/**
 * Generates a valid category ID string (simulating PocketBase record IDs).
 */
const categoryIdArb = fc
  .array(
    fc.constantFrom(
      ...("abcdefghijklmnopqrstuvwxyz0123456789".split(""))
    ),
    { minLength: 5, maxLength: 15 }
  )
  .map((chars) => chars.join(""))

/**
 * Generates a valid condition filter value.
 */
const conditionArb = fc.constantFrom("new" as const, "used" as const)

/**
 * Generates a valid price value (positive integer within VND range).
 */
const priceArb = fc.integer({ min: 0, max: 999_999_999 })

/**
 * Generates a non-empty search string without double quotes (to avoid escaping complexity in assertions).
 */
const searchArb = fc.string({ minLength: 1, maxLength: 50 }).filter(
  (s) => s.trim().length > 0 && !s.includes('"')
)

/**
 * Generates a ProductFilters object with random combinations of filters.
 */
const productFiltersArb: fc.Arbitrary<ProductFilters> = fc.record(
  {
    page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
    category: fc.option(categoryIdArb, { nil: undefined }),
    condition: fc.option(conditionArb, { nil: undefined }),
    minPrice: fc.option(priceArb, { nil: undefined }),
    maxPrice: fc.option(priceArb, { nil: undefined }),
    search: fc.option(searchArb, { nil: undefined }),
    sort: fc.option(fc.constantFrom("-created", "price", "-price", "name"), { nil: undefined }),
  },
  { requiredKeys: [] }
)

// --- Property Tests ---

/**
 * Property 6: Active-only product visibility
 * Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6
 *
 * For any call to getProducts with any combination of filters, every returned
 * Product SHALL have is_active equal to true. We verify this by checking that
 * the built filter string ALWAYS contains the `is_active = true` constraint.
 */
describe("Property 6: Active-only product visibility", () => {
  it("the filter string always contains 'is_active = true' regardless of filter combination", () => {
    fc.assert(
      fc.property(productFiltersArb, (filters) => {
        const filterString = buildProductFilter(filters)

        // The filter must always include the is_active = true constraint
        expect(filterString).toContain("is_active = true")
      }),
      { numRuns: 1000 }
    )
  })

  it("'is_active = true' appears as the first filter clause", () => {
    fc.assert(
      fc.property(productFiltersArb, (filters) => {
        const filterString = buildProductFilter(filters)

        // is_active = true should always be at the start of the filter
        expect(filterString.startsWith("is_active = true")).toBe(true)
      }),
      { numRuns: 1000 }
    )
  })

  it("with no filters provided, the filter is exactly 'is_active = true'", () => {
    const filterString = buildProductFilter({})
    expect(filterString).toBe("is_active = true")
  })

  it("with empty/default options, only active products are targeted", () => {
    const filterString = buildProductFilter()
    expect(filterString).toBe("is_active = true")
  })
})

/**
 * Property 7: Filter correctness
 * Validates: Requirements 1.2, 1.3, 1.4, 1.5
 *
 * For any product filter combination (category, condition, price range, search query),
 * the constructed filter string correctly represents all constraints.
 */
describe("Property 7: Filter correctness", () => {
  it("category filter is correctly included when provided", () => {
    fc.assert(
      fc.property(categoryIdArb, (category) => {
        const filterString = buildProductFilter({ category })

        expect(filterString).toContain(`category = "${category}"`)
      }),
      { numRuns: 500 }
    )
  })

  it("condition filter is correctly included when provided", () => {
    fc.assert(
      fc.property(conditionArb, (condition) => {
        const filterString = buildProductFilter({ condition })

        expect(filterString).toContain(`condition = "${condition}"`)
      }),
      { numRuns: 100 }
    )
  })

  it("minPrice filter is correctly included when provided", () => {
    fc.assert(
      fc.property(priceArb, (minPrice) => {
        const filterString = buildProductFilter({ minPrice })

        expect(filterString).toContain(`price >= ${minPrice}`)
      }),
      { numRuns: 500 }
    )
  })

  it("maxPrice filter is correctly included when provided", () => {
    fc.assert(
      fc.property(priceArb, (maxPrice) => {
        const filterString = buildProductFilter({ maxPrice })

        expect(filterString).toContain(`price <= ${maxPrice}`)
      }),
      { numRuns: 500 }
    )
  })

  it("search filter is correctly included when provided", () => {
    fc.assert(
      fc.property(searchArb, (search) => {
        const filterString = buildProductFilter({ search })

        // Should contain a search clause matching name or description
        expect(filterString).toContain(`name ~ "${search}"`)
        expect(filterString).toContain(`description ~ "${search}"`)
      }),
      { numRuns: 500 }
    )
  })

  it("all provided filters are combined with && operator", () => {
    fc.assert(
      fc.property(
        categoryIdArb,
        conditionArb,
        priceArb,
        priceArb,
        searchArb,
        (category, condition, minPrice, maxPrice, search) => {
          const filterString = buildProductFilter({
            category,
            condition,
            minPrice,
            maxPrice,
            search,
          })

          // Count the number of && separators - should be 5 (6 parts - 1)
          // Parts: is_active, category, condition, minPrice, maxPrice, search
          const parts = filterString.split(" && ")
          expect(parts.length).toBe(6)

          // Verify each constraint is present
          expect(filterString).toContain("is_active = true")
          expect(filterString).toContain(`category = "${category}"`)
          expect(filterString).toContain(`condition = "${condition}"`)
          expect(filterString).toContain(`price >= ${minPrice}`)
          expect(filterString).toContain(`price <= ${maxPrice}`)
          expect(filterString).toContain(`name ~ "${search}"`)
        }
      ),
      { numRuns: 500 }
    )
  })

  it("omitted filters do not appear in the filter string", () => {
    fc.assert(
      fc.property(productFiltersArb, (filters) => {
        const filterString = buildProductFilter(filters)

        if (!filters.category) {
          expect(filterString).not.toContain("category =")
        }
        if (!filters.condition) {
          expect(filterString).not.toContain("condition =")
        }
        if (filters.minPrice === undefined || filters.minPrice === null) {
          expect(filterString).not.toContain("price >=")
        }
        if (filters.maxPrice === undefined || filters.maxPrice === null) {
          expect(filterString).not.toContain("price <=")
        }
        if (!filters.search) {
          expect(filterString).not.toContain("name ~")
          expect(filterString).not.toContain("description ~")
        }
      }),
      { numRuns: 1000 }
    )
  })

  it("search strings with double quotes are properly escaped", () => {
    const searchWithQuotes = fc.string({ minLength: 1, maxLength: 20 }).map(
      (s) => s + '"test'
    )

    fc.assert(
      fc.property(searchWithQuotes, (search) => {
        const filterString = buildProductFilter({ search })

        // The raw unescaped double quote should not break the filter structure
        // The escaped version should be present
        const escapedSearch = search.replace(/"/g, '\\"')
        expect(filterString).toContain(`name ~ "${escapedSearch}"`)
      }),
      { numRuns: 200 }
    )
  })

  it("the number of filter clauses equals 1 (base) plus the number of provided filters", () => {
    fc.assert(
      fc.property(productFiltersArb, (filters) => {
        const filterString = buildProductFilter(filters)
        const parts = filterString.split(" && ")

        let expectedParts = 1 // is_active = true is always present

        if (filters.category) expectedParts++
        if (filters.condition) expectedParts++
        if (filters.minPrice !== undefined && filters.minPrice !== null) expectedParts++
        if (filters.maxPrice !== undefined && filters.maxPrice !== null) expectedParts++
        if (filters.search) expectedParts++

        expect(parts.length).toBe(expectedParts)
      }),
      { numRuns: 1000 }
    )
  })
})
