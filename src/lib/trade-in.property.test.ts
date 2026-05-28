import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { calculatePriceDifference } from "./trade-in"

/**
 * Property 11: Trade-in price difference calculation
 *
 * For any Trade_In_Request evaluation where a new_product is specified,
 * the price_difference SHALL equal the new product price minus the trade_in_value.
 *
 * **Validates: Requirements 8.4, 8.5**
 */
describe("Property 11: Trade-in price difference calculation", () => {
  // Arbitrary for valid product prices (positive integers in VND, up to 999,999,999)
  const productPriceArb = fc.integer({ min: 1, max: 999_999_999 })

  // Arbitrary for valid trade-in values (positive integers in VND)
  const tradeInValueArb = fc.integer({ min: 1, max: 999_999_999 })

  it("price_difference always equals exactly (newProductPrice - tradeInValue)", () => {
    fc.assert(
      fc.property(productPriceArb, tradeInValueArb, (newProductPrice, tradeInValue) => {
        const priceDifference = calculatePriceDifference(newProductPrice, tradeInValue)
        expect(priceDifference).toBe(newProductPrice - tradeInValue)
      })
    )
  })

  it("if tradeInValue >= newProductPrice, price_difference should be <= 0 (customer breaks even or gets money back)", () => {
    fc.assert(
      fc.property(
        productPriceArb,
        tradeInValueArb,
        (newProductPrice, tradeInValue) => {
          fc.pre(tradeInValue >= newProductPrice)
          const priceDifference = calculatePriceDifference(newProductPrice, tradeInValue)
          expect(priceDifference).toBeLessThanOrEqual(0)
        }
      )
    )
  })

  it("if tradeInValue < newProductPrice, price_difference should be > 0 (customer pays the difference)", () => {
    fc.assert(
      fc.property(
        productPriceArb,
        tradeInValueArb,
        (newProductPrice, tradeInValue) => {
          fc.pre(tradeInValue < newProductPrice)
          const priceDifference = calculatePriceDifference(newProductPrice, tradeInValue)
          expect(priceDifference).toBeGreaterThan(0)
        }
      )
    )
  })

  it("price_difference is zero when tradeInValue equals newProductPrice", () => {
    fc.assert(
      fc.property(productPriceArb, (price) => {
        const priceDifference = calculatePriceDifference(price, price)
        expect(priceDifference).toBe(0)
      })
    )
  })
})
