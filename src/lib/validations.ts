import { z } from "zod"

// Vietnamese phone number regex: 10 digits starting with 0 followed by 3, 5, 7, 8, or 9
export const VIETNAMESE_PHONE_REGEX = /^0[35789]\d{8}$/

// Shared field schemas
const customerNameSchema = z
  .string()
  .min(1, "Tên khách hàng không được để trống")
  .max(100, "Tên khách hàng không được vượt quá 100 ký tự")

const customerPhoneSchema = z
  .string()
  .regex(
    VIETNAMESE_PHONE_REGEX,
    "Số điện thoại không hợp lệ (VD: 0912345678)"
  )

// Order form validation schema
// Validates: Requirements 3.2, 3.3, 3.4, 3.5
export const orderFormSchema = z.object({
  customer_name: customerNameSchema,
  customer_phone: customerPhoneSchema,
  customer_address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(500, "Địa chỉ không được vượt quá 500 ký tự"),
  payment_method: z.enum(["cod", "bank_transfer"], {
    error: "Phương thức thanh toán không hợp lệ",
  }),
})

export type OrderFormData = z.infer<typeof orderFormSchema>

// Repair request form validation schema
// Validates: Requirements 5.1, 5.2, 5.3, 5.4
export const repairFormSchema = z.object({
  customer_name: customerNameSchema,
  customer_phone: customerPhoneSchema,
  device_model: z
    .string()
    .min(1, "Model thiết bị không được để trống")
    .max(100, "Model thiết bị không được vượt quá 100 ký tự"),
  issue_description: z
    .string()
    .min(10, "Mô tả lỗi phải có ít nhất 10 ký tự")
    .max(1000, "Mô tả lỗi không được vượt quá 1000 ký tự"),
})

export type RepairFormData = z.infer<typeof repairFormSchema>

// Trade-in request form validation schema
// Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
export const tradeInFormSchema = z.object({
  customer_name: customerNameSchema,
  customer_phone: customerPhoneSchema,
  old_device_model: z
    .string()
    .min(1, "Model thiết bị cũ không được để trống")
    .max(100, "Model thiết bị cũ không được vượt quá 100 ký tự"),
  old_device_storage: z
    .string()
    .min(1, "Dung lượng thiết bị cũ không được để trống"),
  old_device_condition: z
    .string()
    .min(10, "Mô tả tình trạng phải có ít nhất 10 ký tự")
    .max(1000, "Mô tả tình trạng không được vượt quá 1000 ký tự"),
})

export type TradeInFormData = z.infer<typeof tradeInFormSchema>
