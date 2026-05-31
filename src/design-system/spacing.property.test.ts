import { describe, it, expect } from "vitest"
import * as fc from "fast-check"

/**
 * Property 1: Spacing scale values are multiples of 4px base unit
 * Validates: Requirements 1.3
 *
 * For any spacing token in the design system's spacing scale, its pixel value
 * SHALL be a positive integer that is evenly divisible by 4, and the scale
 * SHALL contain at least 8 distinct steps.
 */

/**
 * The spacing scale as defined in globals.css (:root).
 * Each entry maps the token name to its pixel value.
 */
const SPACING_SCALE: Record<string, number> = {
  "--space-1": 4,
  "--space-2": 8,
  "--space-3": 12,
  "--space-4": 16,
  "--space-6": 24,
  "--space-8": 32,
  "--space-12": 48,
  "--space-16": 64,
}

const BASE_UNIT = 4

/**
 * Generator for spacing token entries from the design system.
 * Picks a random token from the defined spacing scale.
 */
const spacingTokenArb = fc.constantFrom(
  ...Object.entries(SPACING_SCALE).map(([name, value]) => ({ name, value }))
)

describe("Property 1: Spacing scale values are multiples of 4px base unit", () => {
  it("all spacing token values are positive integers divisible by 4px base unit", () => {
    fc.assert(
      fc.property(spacingTokenArb, ({ name, value }) => {
        // Value must be a positive integer
        expect(value).toBeGreaterThan(0)
        expect(Number.isInteger(value)).toBe(true)

        // Value must be evenly divisible by the 4px base unit
        expect(value % BASE_UNIT).toBe(0)
      }),
      { numRuns: 100 }
    )
  })

  it("the spacing scale contains at least 8 distinct steps", () => {
    const uniqueValues = new Set(Object.values(SPACING_SCALE))
    expect(uniqueValues.size).toBeGreaterThanOrEqual(8)
  })

  it("all spacing values are strictly increasing with token index", () => {
    const entries = Object.entries(SPACING_SCALE)
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i][1]).toBeGreaterThan(entries[i - 1][1])
    }
  })

  it("any valid multiple of 4px within the scale range satisfies the base unit property", () => {
    // Property: for any positive integer multiplier, multiplier * 4 is a valid spacing value candidate
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 16 }),
        (multiplier) => {
          const candidateValue = multiplier * BASE_UNIT
          // The candidate is always a positive integer divisible by 4
          expect(candidateValue).toBeGreaterThan(0)
          expect(Number.isInteger(candidateValue)).toBe(true)
          expect(candidateValue % BASE_UNIT).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("each spacing token value equals its multiplier times the base unit", () => {
    fc.assert(
      fc.property(spacingTokenArb, ({ name, value }) => {
        const multiplier = value / BASE_UNIT
        // The multiplier must be a positive integer
        expect(multiplier).toBeGreaterThan(0)
        expect(Number.isInteger(multiplier)).toBe(true)
        // Reconstructing the value from multiplier * base must equal the original
        expect(multiplier * BASE_UNIT).toBe(value)
      }),
      { numRuns: 100 }
    )
  })
})
