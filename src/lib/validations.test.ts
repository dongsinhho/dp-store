import { describe, it, expect } from "vitest"
import {
  orderFormSchema,
  repairFormSchema,
  tradeInFormSchema,
  VIETNAMESE_PHONE_REGEX,
} from "./validations"

describe("VIETNAMESE_PHONE_REGEX", () => {
  it("accepts valid Vietnamese phone numbers", () => {
    const validNumbers = [
      "0312345678", // prefix 3
      "0512345678", // prefix 5
      "0712345678", // prefix 7
      "0812345678", // prefix 8
      "0912345678", // prefix 9
    ]
    for (const num of validNumbers) {
      expect(VIETNAMESE_PHONE_REGEX.test(num)).toBe(true)
    }
  })

  it("rejects invalid phone numbers", () => {
    const invalidNumbers = [
      "0112345678", // invalid prefix 1
      "0212345678", // invalid prefix 2
      "0412345678", // invalid prefix 4
      "0612345678", // invalid prefix 6
      "1912345678", // doesn't start with 0
      "091234567",  // too short (9 digits)
      "09123456789", // too long (11 digits)
      "abcdefghij", // non-numeric
      "",           // empty
    ]
    for (const num of invalidNumbers) {
      expect(VIETNAMESE_PHONE_REGEX.test(num)).toBe(false)
    }
  })
})

describe("orderFormSchema", () => {
  const validOrder = {
    customer_name: "Nguyễn Văn A",
    customer_phone: "0912345678",
    customer_address: "123 Đường ABC, Quận 1, TP.HCM",
    payment_method: "cod" as const,
  }

  it("accepts valid order data", () => {
    const result = orderFormSchema.safeParse(validOrder)
    expect(result.success).toBe(true)
  })

  it("accepts bank_transfer payment method", () => {
    const result = orderFormSchema.safeParse({
      ...validOrder,
      payment_method: "bank_transfer",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty customer_name", () => {
    const result = orderFormSchema.safeParse({
      ...validOrder,
      customer_name: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects customer_name exceeding 100 characters", () => {
    const result = orderFormSchema.safeParse({
      ...validOrder,
      customer_name: "A".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid phone number", () => {
    const result = orderFormSchema.safeParse({
      ...validOrder,
      customer_phone: "0112345678",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty customer_address", () => {
    const result = orderFormSchema.safeParse({
      ...validOrder,
      customer_address: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects customer_address exceeding 500 characters", () => {
    const result = orderFormSchema.safeParse({
      ...validOrder,
      customer_address: "A".repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid payment_method", () => {
    const result = orderFormSchema.safeParse({
      ...validOrder,
      payment_method: "credit_card",
    })
    expect(result.success).toBe(false)
  })
})

describe("repairFormSchema", () => {
  const validRepair = {
    customer_name: "Trần Thị B",
    customer_phone: "0387654321",
    device_model: "iPhone 14 Pro",
    issue_description: "Màn hình bị vỡ góc trên bên phải",
  }

  it("accepts valid repair data", () => {
    const result = repairFormSchema.safeParse(validRepair)
    expect(result.success).toBe(true)
  })

  it("rejects empty device_model", () => {
    const result = repairFormSchema.safeParse({
      ...validRepair,
      device_model: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects device_model exceeding 100 characters", () => {
    const result = repairFormSchema.safeParse({
      ...validRepair,
      device_model: "A".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("rejects issue_description shorter than 10 characters", () => {
    const result = repairFormSchema.safeParse({
      ...validRepair,
      issue_description: "Hỏng",
    })
    expect(result.success).toBe(false)
  })

  it("rejects issue_description exceeding 1000 characters", () => {
    const result = repairFormSchema.safeParse({
      ...validRepair,
      issue_description: "A".repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it("accepts issue_description with exactly 10 characters", () => {
    const result = repairFormSchema.safeParse({
      ...validRepair,
      issue_description: "1234567890",
    })
    expect(result.success).toBe(true)
  })
})

describe("tradeInFormSchema", () => {
  const validTradeIn = {
    customer_name: "Lê Văn C",
    customer_phone: "0567890123",
    old_device_model: "iPhone 13",
    old_device_storage: "128GB",
    old_device_condition: "Máy còn đẹp, không trầy xước",
  }

  it("accepts valid trade-in data", () => {
    const result = tradeInFormSchema.safeParse(validTradeIn)
    expect(result.success).toBe(true)
  })

  it("rejects empty old_device_model", () => {
    const result = tradeInFormSchema.safeParse({
      ...validTradeIn,
      old_device_model: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects old_device_model exceeding 100 characters", () => {
    const result = tradeInFormSchema.safeParse({
      ...validTradeIn,
      old_device_model: "A".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty old_device_storage", () => {
    const result = tradeInFormSchema.safeParse({
      ...validTradeIn,
      old_device_storage: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects old_device_condition shorter than 10 characters", () => {
    const result = tradeInFormSchema.safeParse({
      ...validTradeIn,
      old_device_condition: "Tốt",
    })
    expect(result.success).toBe(false)
  })

  it("rejects old_device_condition exceeding 1000 characters", () => {
    const result = tradeInFormSchema.safeParse({
      ...validTradeIn,
      old_device_condition: "A".repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it("accepts old_device_condition with exactly 10 characters", () => {
    const result = tradeInFormSchema.safeParse({
      ...validTradeIn,
      old_device_condition: "1234567890",
    })
    expect(result.success).toBe(true)
  })
})
