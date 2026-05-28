import { describe, it } from "vitest"
import * as fc from "fast-check"
import { generateSlug } from "./product-validation"

/**
 * Property 13: Slug uniqueness and generation
 * Validates: Requirements 9.4, 9.5
 *
 * For any Product name, the auto-generated slug SHALL be a valid URL-safe string,
 * and for any set of Products, no two Products SHALL share the same slug.
 */
describe("Property 13: Slug uniqueness and generation", () => {
  it("slugs only contain lowercase letters, numbers, and hyphens", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = generateSlug(input)
        // Empty slug is valid (from empty or all-special-char input)
        if (slug === "") return true
        return /^[a-z0-9-]+$/.test(slug)
      }),
      { numRuns: 1000 }
    )
  })

  it("slugs never start or end with a hyphen (for non-empty slugs)", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = generateSlug(input)
        if (slug === "") return true
        return !slug.startsWith("-") && !slug.endsWith("-")
      }),
      { numRuns: 1000 }
    )
  })

  it("slugs never contain consecutive hyphens", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = generateSlug(input)
        return !slug.includes("--")
      }),
      { numRuns: 1000 }
    )
  })

  it("same input always produces same slug (deterministic)", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug1 = generateSlug(input)
        const slug2 = generateSlug(input)
        return slug1 === slug2
      }),
      { numRuns: 1000 }
    )
  })

  it("different inputs with different alphanumeric content produce different slugs", () => {
    // Generate pairs of strings that have different alphanumeric content
    const alphanumericContent = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]/g, "")

    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => /[a-z0-9]/i.test(s)),
        fc.string({ minLength: 1 }).filter((s) => /[a-z0-9]/i.test(s)),
        (a, b) => {
          // Only test when the alphanumeric content is actually different
          if (alphanumericContent(a) === alphanumericContent(b)) return true
          const slugA = generateSlug(a)
          const slugB = generateSlug(b)
          return slugA !== slugB
        }
      ),
      { numRuns: 1000 }
    )
  })
})
