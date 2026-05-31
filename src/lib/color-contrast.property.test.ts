import { describe, it, expect } from "vitest"
import * as fc from "fast-check"

/**
 * **Validates: Requirements 1.6, 14.5**
 *
 * Property 2: Color contrast meets WCAG AA
 *
 * For any semantic text-foreground and background color pair defined in the
 * design system palette, the computed WCAG 2.1 contrast ratio SHALL be at
 * least 4.5:1 for normal text sizes and at least 3:1 for large text sizes.
 */

// --- Color tokens from the design system (globals.css :root) ---

interface ColorPair {
  name: string
  foreground: string
  background: string
}

/**
 * Semantic text-foreground and background color pairs from the design system.
 * These are the pairs that are used for text rendering in the UI.
 */
const designSystemColorPairs: ColorPair[] = [
  {
    name: "primary on primary-foreground",
    foreground: "#2563eb",
    background: "#ffffff",
  },
  {
    name: "primary-foreground on primary",
    foreground: "#ffffff",
    background: "#2563eb",
  },
  {
    name: "secondary on secondary-foreground",
    foreground: "#7c3aed",
    background: "#ffffff",
  },
  {
    name: "secondary-foreground on secondary",
    foreground: "#ffffff",
    background: "#7c3aed",
  },
  {
    name: "accent-foreground on accent",
    foreground: "#ffffff",
    background: "#0e7490",
  },
  {
    name: "foreground on background",
    foreground: "#171717",
    background: "#ffffff",
  },
]

// --- WCAG 2.1 Contrast Ratio Calculation ---

/**
 * Parse a hex color string to RGB components (0-255).
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "")
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  }
}

/**
 * Convert an sRGB channel value (0-255) to its relative luminance component.
 * Per WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function linearize(channel: number): number {
  const srgb = channel / 255
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4)
}

/**
 * Calculate the relative luminance of a color.
 * Per WCAG 2.1: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

/**
 * Calculate the WCAG 2.1 contrast ratio between two colors.
 * Returns a value >= 1, where 1 means no contrast and 21 is maximum.
 */
function contrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(color1)
  const l2 = relativeLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// --- Property-Based Test ---

describe("Feature: modern-website-redesign, Property 2: Color contrast meets WCAG AA", () => {
  // Generator that picks any color pair from the design system
  const colorPairArb = fc.constantFrom(...designSystemColorPairs)

  it("all text-foreground/background pairs meet WCAG AA for normal text (4.5:1)", () => {
    fc.assert(
      fc.property(colorPairArb, (pair) => {
        const ratio = contrastRatio(pair.foreground, pair.background)
        expect(ratio).toBeGreaterThanOrEqual(4.5)
      }),
      { numRuns: 100 }
    )
  })

  it("all text-foreground/background pairs meet WCAG AA for large text (3:1)", () => {
    fc.assert(
      fc.property(colorPairArb, (pair) => {
        const ratio = contrastRatio(pair.foreground, pair.background)
        expect(ratio).toBeGreaterThanOrEqual(3)
      }),
      { numRuns: 100 }
    )
  })

  // Verify the contrast ratio calculation itself is correct with known values
  it("contrast ratio calculation is correct for known pairs", () => {
    // Black on white should be 21:1
    const blackWhite = contrastRatio("#000000", "#ffffff")
    expect(blackWhite).toBeCloseTo(21, 0)

    // White on white should be 1:1
    const whiteWhite = contrastRatio("#ffffff", "#ffffff")
    expect(whiteWhite).toBeCloseTo(1, 0)
  })

  // Property: contrast ratio is symmetric (order of colors doesn't matter)
  it("contrast ratio is symmetric", () => {
    fc.assert(
      fc.property(colorPairArb, (pair) => {
        const ratio1 = contrastRatio(pair.foreground, pair.background)
        const ratio2 = contrastRatio(pair.background, pair.foreground)
        expect(ratio1).toBeCloseTo(ratio2, 10)
      }),
      { numRuns: 100 }
    )
  })

  // Property: contrast ratio is always >= 1
  it("contrast ratio is always at least 1", () => {
    fc.assert(
      fc.property(colorPairArb, (pair) => {
        const ratio = contrastRatio(pair.foreground, pair.background)
        expect(ratio).toBeGreaterThanOrEqual(1)
      }),
      { numRuns: 100 }
    )
  })
})
