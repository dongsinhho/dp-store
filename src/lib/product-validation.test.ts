import { describe, it, expect } from "vitest"
import { generateSlug, productSchema } from "./product-validation"

describe("generateSlug", () => {
  it("converts name to lowercase", () => {
    expect(generateSlug("iPhone 15 Pro Max")).toBe("iphone-15-pro-max")
  })

  it("removes Vietnamese diacritics", () => {
    expect(generateSlug("iPhone 15 Pro Max Xanh Đậm")).toBe(
      "iphone-15-pro-max-xanh-dam"
    )
  })

  it("handles various Vietnamese characters", () => {
    expect(generateSlug("Điện thoại cũ giá rẻ")).toBe("dien-thoai-cu-gia-re")
  })

  it("replaces special characters with hyphens", () => {
    expect(generateSlug("iPhone 15 (256GB) - Mới")).toBe("iphone-15-256gb-moi")
  })

  it("collapses multiple hyphens into one", () => {
    expect(generateSlug("iPhone---15   Pro")).toBe("iphone-15-pro")
  })

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug("  iPhone 15  ")).toBe("iphone-15")
  })

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("")
  })

  it("handles string with only special characters", () => {
    expect(generateSlug("@#$%")).toBe("")
  })

  it("preserves numbers", () => {
    expect(generateSlug("iPhone 15 Pro 256GB")).toBe("iphone-15-pro-256gb")
  })
})

describe("productSchema", () => {
  const validProduct = {
    name: "iPhone 15 Pro Max 256GB",
    category: "iphone-15",
    condition: "new" as const,
    price: 29990000,
    storage: "256GB",
    color: "Black",
    description: "Brand new iPhone 15 Pro Max",
    images: ["image1.jpg"],
    stock: 10,
    is_active: true,
  }

  it("validates a correct new product", () => {
    const result = productSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it("validates a correct used product with battery_health", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      condition: "used",
      battery_health: 85,
    })
    expect(result.success).toBe(true)
  })

  it("rejects used product without battery_health", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      condition: "used",
    })
    expect(result.success).toBe(false)
  })

  it("rejects price of 0", () => {
    const result = productSchema.safeParse({ ...validProduct, price: 0 })
    expect(result.success).toBe(false)
  })

  it("rejects negative price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: -1 })
    expect(result.success).toBe(false)
  })

  it("rejects price exceeding 999999999", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      price: 1000000000,
    })
    expect(result.success).toBe(false)
  })

  it("accepts price at maximum boundary (999999999)", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      price: 999999999,
    })
    expect(result.success).toBe(true)
  })

  it("rejects negative stock", () => {
    const result = productSchema.safeParse({ ...validProduct, stock: -1 })
    expect(result.success).toBe(false)
  })

  it("rejects stock exceeding 9999", () => {
    const result = productSchema.safeParse({ ...validProduct, stock: 10000 })
    expect(result.success).toBe(false)
  })

  it("accepts stock at maximum boundary (9999)", () => {
    const result = productSchema.safeParse({ ...validProduct, stock: 9999 })
    expect(result.success).toBe(true)
  })

  it("accepts stock of 0", () => {
    const result = productSchema.safeParse({ ...validProduct, stock: 0 })
    expect(result.success).toBe(true)
  })

  it("rejects battery_health below 0", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      condition: "used",
      battery_health: -1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects battery_health above 100", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      condition: "used",
      battery_health: 101,
    })
    expect(result.success).toBe(false)
  })

  it("accepts battery_health at boundaries (0 and 100)", () => {
    expect(
      productSchema.safeParse({
        ...validProduct,
        condition: "used",
        battery_health: 0,
      }).success
    ).toBe(true)
    expect(
      productSchema.safeParse({
        ...validProduct,
        condition: "used",
        battery_health: 100,
      }).success
    ).toBe(true)
  })

  it("rejects name exceeding 200 characters", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      name: "a".repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it("accepts name at maximum length (200 characters)", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      name: "a".repeat(200),
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = productSchema.safeParse({ ...validProduct, name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects empty images array", () => {
    const result = productSchema.safeParse({ ...validProduct, images: [] })
    expect(result.success).toBe(false)
  })

  it("rejects more than 10 images", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      images: Array(11).fill("img.jpg"),
    })
    expect(result.success).toBe(false)
  })

  it("accepts exactly 10 images", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      images: Array(10).fill("img.jpg"),
    })
    expect(result.success).toBe(true)
  })

  it("allows battery_health to be omitted for new products", () => {
    const result = productSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })
})
