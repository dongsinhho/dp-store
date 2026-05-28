import { z } from "zod"

/**
 * Vietnamese diacritics mapping for slug generation.
 * Maps accented characters to their ASCII equivalents.
 */
const VIETNAMESE_DIACRITICS_MAP: Record<string, string> = {
  à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
  ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
  â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
  đ: "d",
  è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
  ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
  ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
  ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
  ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
  ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
  ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
  ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
  ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
}

/**
 * Generates a URL-safe slug from a product name.
 * - Converts to lowercase
 * - Removes Vietnamese diacritics
 * - Replaces spaces and special characters with hyphens
 * - Collapses multiple consecutive hyphens into one
 * - Trims leading/trailing hyphens
 */
export function generateSlug(name: string): string {
  let slug = name.toLowerCase()

  // Replace Vietnamese diacritics
  slug = slug
    .split("")
    .map((char) => VIETNAMESE_DIACRITICS_MAP[char] ?? char)
    .join("")

  // Replace spaces and special characters with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, "-")

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, "")

  return slug
}

/**
 * Zod schema for Product validation.
 * Validates: Requirements 9.1, 9.2, 9.3, 9.5, 9.6, 9.7
 */
export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, "Product name is required")
      .max(200, "Product name must not exceed 200 characters"),
    slug: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    condition: z.enum(["new", "used"]),
    price: z
      .number()
      .gt(0, "Price must be greater than 0")
      .lte(999999999, "Price must not exceed 999,999,999"),
    original_price: z
      .number()
      .gt(0, "Original price must be greater than 0")
      .lte(999999999, "Original price must not exceed 999,999,999")
      .optional(),
    storage: z.string().min(1, "Storage is required"),
    color: z.string().min(1, "Color is required"),
    battery_health: z
      .number()
      .int("Battery health must be an integer")
      .gte(0, "Battery health must be at least 0")
      .lte(100, "Battery health must not exceed 100")
      .optional(),
    description: z.string().min(1, "Description is required"),
    images: z
      .array(z.string())
      .min(1, "At least 1 image is required")
      .max(10, "Maximum 10 images allowed"),
    stock: z
      .number()
      .int("Stock must be an integer")
      .gte(0, "Stock must be at least 0")
      .lte(9999, "Stock must not exceed 9,999"),
    is_active: z.boolean(),
  })
  .refine(
    (data) => {
      // battery_health is required for used products
      if (data.condition === "used") {
        return (
          data.battery_health !== undefined && data.battery_health !== null
        )
      }
      return true
    },
    {
      message: "Battery health is required for used products",
      path: ["battery_health"],
    }
  )

export type ProductInput = z.input<typeof productSchema>
export type ProductValidated = z.output<typeof productSchema>
