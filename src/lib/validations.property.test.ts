import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import {
  orderFormSchema,
  repairFormSchema,
  tradeInFormSchema,
  VIETNAMESE_PHONE_REGEX,
} from "./validations"

/**
 * Property 12: Form validation rejects invalid inputs
 *
 * For any order, repair request, or trade-in submission with empty required fields
 * or invalid Vietnamese phone numbers, the System SHALL reject the submission and
 * not create a record.
 *
 * **Validates: Requirements 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4**
 */

// --- Generators ---

/** Generates a valid Vietnamese phone number matching /^0[35789]\d{8}$/ */
const validVietnamesePhoneArb = fc
  .tuple(
    fc.constantFrom("3", "5", "7", "8", "9"),
    fc.stringMatching(/^\d{8}$/)
  )
  .map(([prefix, rest]) => `0${prefix}${rest}`)

/** Generates an invalid phone number with wrong prefix (0, 1, 2, 4, 6) */
const invalidPrefixPhoneArb = fc
  .tuple(
    fc.constantFrom("0", "1", "2", "4", "6"),
    fc.stringMatching(/^\d{8}$/)
  )
  .map(([prefix, rest]) => `0${prefix}${rest}`)

/** Generates an invalid phone number with wrong length (not 10 digits total) */
const invalidLengthPhoneArb = fc
  .tuple(
    fc.constantFrom("3", "5", "7", "8", "9"),
    fc.oneof(
      // Too short: 1-7 digits after prefix
      fc.stringMatching(/^\d{1,7}$/),
      // Too long: 9-12 digits after prefix
      fc.stringMatching(/^\d{9,12}$/)
    )
  )
  .map(([prefix, rest]) => `0${prefix}${rest}`)

/** Generates a valid non-empty string within length bounds */
const validNameArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0)

/** Generates a valid address string */
const validAddressArb = fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0)

/** Generates a valid device model string */
const validDeviceModelArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0)

/** Generates a valid issue description (min 10 chars) */
const validIssueDescriptionArb = fc.string({ minLength: 10, maxLength: 1000 })

/** Generates a valid old device condition (min 10 chars) */
const validOldDeviceConditionArb = fc.string({ minLength: 10, maxLength: 1000 })

/** Generates a valid storage string */
const validStorageArb = fc.constantFrom("64GB", "128GB", "256GB", "512GB", "1TB")

/** Generates a string shorter than 10 characters (for issue_description/old_device_condition) */
const shortDescriptionArb = fc.string({ minLength: 0, maxLength: 9 })

describe("Property 12: Form validation rejects invalid inputs", () => {
  describe("Vietnamese phone number validation", () => {
    it("valid Vietnamese phone numbers are always accepted by regex", () => {
      fc.assert(
        fc.property(validVietnamesePhoneArb, (phone) => {
          expect(VIETNAMESE_PHONE_REGEX.test(phone)).toBe(true)
        }),
        { numRuns: 200 }
      )
    })

    it("phone numbers with invalid prefix are always rejected", () => {
      fc.assert(
        fc.property(invalidPrefixPhoneArb, (phone) => {
          expect(VIETNAMESE_PHONE_REGEX.test(phone)).toBe(false)
        }),
        { numRuns: 200 }
      )
    })

    it("phone numbers with wrong length are always rejected", () => {
      fc.assert(
        fc.property(invalidLengthPhoneArb, (phone) => {
          expect(VIETNAMESE_PHONE_REGEX.test(phone)).toBe(false)
        }),
        { numRuns: 200 }
      )
    })

    it("phone numbers not starting with 0 are always rejected", () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.constantFrom("1", "2", "3", "4", "5", "6", "7", "8", "9"),
            fc.stringMatching(/^\d{9}$/)
          ).map(([first, rest]) => `${first}${rest}`),
          (phone) => {
            expect(VIETNAMESE_PHONE_REGEX.test(phone)).toBe(false)
          }
        ),
        { numRuns: 200 }
      )
    })
  })

  describe("Order form validation", () => {
    it("valid order form data always passes validation", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          validAddressArb,
          fc.constantFrom("cod" as const, "bank_transfer" as const),
          (name, phone, address, paymentMethod) => {
            const result = orderFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              customer_address: address,
              payment_method: paymentMethod,
            })
            expect(result.success).toBe(true)
          }
        ),
        { numRuns: 200 }
      )
    })

    it("order with empty customer_name always fails", () => {
      fc.assert(
        fc.property(
          validVietnamesePhoneArb,
          validAddressArb,
          fc.constantFrom("cod" as const, "bank_transfer" as const),
          (phone, address, paymentMethod) => {
            const result = orderFormSchema.safeParse({
              customer_name: "",
              customer_phone: phone,
              customer_address: address,
              payment_method: paymentMethod,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it("order with invalid phone number always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          invalidPrefixPhoneArb,
          validAddressArb,
          fc.constantFrom("cod" as const, "bank_transfer" as const),
          (name, phone, address, paymentMethod) => {
            const result = orderFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              customer_address: address,
              payment_method: paymentMethod,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 200 }
      )
    })

    it("order with empty customer_address always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          fc.constantFrom("cod" as const, "bank_transfer" as const),
          (name, phone, paymentMethod) => {
            const result = orderFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              customer_address: "",
              payment_method: paymentMethod,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe("Repair form validation", () => {
    it("valid repair form data always passes validation", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          validDeviceModelArb,
          validIssueDescriptionArb,
          (name, phone, deviceModel, issueDescription) => {
            const result = repairFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              device_model: deviceModel,
              issue_description: issueDescription,
            })
            expect(result.success).toBe(true)
          }
        ),
        { numRuns: 200 }
      )
    })

    it("repair with empty customer_name always fails", () => {
      fc.assert(
        fc.property(
          validVietnamesePhoneArb,
          validDeviceModelArb,
          validIssueDescriptionArb,
          (phone, deviceModel, issueDescription) => {
            const result = repairFormSchema.safeParse({
              customer_name: "",
              customer_phone: phone,
              device_model: deviceModel,
              issue_description: issueDescription,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it("repair with invalid phone number always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          invalidPrefixPhoneArb,
          validDeviceModelArb,
          validIssueDescriptionArb,
          (name, phone, deviceModel, issueDescription) => {
            const result = repairFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              device_model: deviceModel,
              issue_description: issueDescription,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 200 }
      )
    })

    it("repair with empty device_model always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          validIssueDescriptionArb,
          (name, phone, issueDescription) => {
            const result = repairFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              device_model: "",
              issue_description: issueDescription,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it("repair with issue_description shorter than 10 chars always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          validDeviceModelArb,
          shortDescriptionArb,
          (name, phone, deviceModel, shortDesc) => {
            const result = repairFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              device_model: deviceModel,
              issue_description: shortDesc,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 200 }
      )
    })
  })

  describe("Trade-in form validation", () => {
    it("valid trade-in form data always passes validation", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          validDeviceModelArb,
          validStorageArb,
          validOldDeviceConditionArb,
          (name, phone, deviceModel, storage, condition) => {
            const result = tradeInFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              old_device_model: deviceModel,
              old_device_storage: storage,
              old_device_condition: condition,
            })
            expect(result.success).toBe(true)
          }
        ),
        { numRuns: 200 }
      )
    })

    it("trade-in with empty customer_name always fails", () => {
      fc.assert(
        fc.property(
          validVietnamesePhoneArb,
          validDeviceModelArb,
          validStorageArb,
          validOldDeviceConditionArb,
          (phone, deviceModel, storage, condition) => {
            const result = tradeInFormSchema.safeParse({
              customer_name: "",
              customer_phone: phone,
              old_device_model: deviceModel,
              old_device_storage: storage,
              old_device_condition: condition,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it("trade-in with invalid phone number always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          invalidPrefixPhoneArb,
          validDeviceModelArb,
          validStorageArb,
          validOldDeviceConditionArb,
          (name, phone, deviceModel, storage, condition) => {
            const result = tradeInFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              old_device_model: deviceModel,
              old_device_storage: storage,
              old_device_condition: condition,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 200 }
      )
    })

    it("trade-in with empty old_device_model always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          validStorageArb,
          validOldDeviceConditionArb,
          (name, phone, storage, condition) => {
            const result = tradeInFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              old_device_model: "",
              old_device_storage: storage,
              old_device_condition: condition,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it("trade-in with empty old_device_storage always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          validDeviceModelArb,
          validOldDeviceConditionArb,
          (name, phone, deviceModel, condition) => {
            const result = tradeInFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              old_device_model: deviceModel,
              old_device_storage: "",
              old_device_condition: condition,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it("trade-in with old_device_condition shorter than 10 chars always fails", () => {
      fc.assert(
        fc.property(
          validNameArb,
          validVietnamesePhoneArb,
          validDeviceModelArb,
          validStorageArb,
          shortDescriptionArb,
          (name, phone, deviceModel, storage, shortCondition) => {
            const result = tradeInFormSchema.safeParse({
              customer_name: name,
              customer_phone: phone,
              old_device_model: deviceModel,
              old_device_storage: storage,
              old_device_condition: shortCondition,
            })
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 200 }
      )
    })
  })
})
