"use server"

import { createServerPb } from "@/lib/pocketbase"
import { tradeInFormSchema } from "@/lib/validations"
import { validateFiles, type FileInfo } from "@/lib/file-upload-validation"

export interface TradeInRequestResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

export interface ActiveProduct {
  id: string
  name: string
  price: number
}

export async function getActiveProducts(): Promise<ActiveProduct[]> {
  try {
    const pb = createServerPb()
    const result = await pb.collection("products").getFullList({
      filter: "is_active = true",
      sort: "name",
      fields: "id,name,price",
    })
    return result as unknown as ActiveProduct[]
  } catch (error) {
    console.error("Failed to fetch active products:", error)
    return []
  }
}

export async function submitTradeInRequest(
  formData: FormData
): Promise<TradeInRequestResult> {
  // Extract text fields
  const rawData = {
    customer_name: formData.get("customer_name") as string,
    customer_phone: formData.get("customer_phone") as string,
    old_device_model: formData.get("old_device_model") as string,
    old_device_storage: formData.get("old_device_storage") as string,
    old_device_condition: formData.get("old_device_condition") as string,
  }

  // Validate text fields with Zod
  const result = tradeInFormSchema.safeParse(rawData)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    return { success: false, fieldErrors }
  }

  // Extract optional fields
  const oldDeviceBattery = formData.get("old_device_battery") as string
  const newProduct = formData.get("new_product") as string

  // Extract and validate files
  const files = formData.getAll("old_device_images") as File[]
  const validFiles = files.filter((f) => f.size > 0)

  if (validFiles.length > 0) {
    const fileInfos: FileInfo[] = validFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))

    const fileValidation = validateFiles(fileInfos)
    if (!fileValidation.valid) {
      return {
        success: false,
        error: fileValidation.errors.join(" "),
      }
    }
  }

  // Validate new_product if selected
  if (newProduct) {
    try {
      const pb = createServerPb()
      const product = await pb.collection("products").getOne(newProduct)
      if (!product.is_active) {
        return {
          success: false,
          error: "Sản phẩm muốn đổi không còn bán.",
        }
      }
    } catch {
      return {
        success: false,
        error: "Sản phẩm muốn đổi không tồn tại.",
      }
    }
  }

  // Create trade-in request in PocketBase
  try {
    const pb = createServerPb()

    const pbFormData = new FormData()
    pbFormData.append("customer_name", result.data.customer_name)
    pbFormData.append("customer_phone", result.data.customer_phone)
    pbFormData.append("old_device_model", result.data.old_device_model)
    pbFormData.append("old_device_storage", result.data.old_device_storage)
    pbFormData.append("old_device_condition", result.data.old_device_condition)
    pbFormData.append("status", "pending")

    if (oldDeviceBattery) {
      pbFormData.append("old_device_battery", oldDeviceBattery)
    }

    if (newProduct) {
      pbFormData.append("new_product", newProduct)
    }

    for (const file of validFiles) {
      pbFormData.append("old_device_images", file)
    }

    await pb.collection("trade_in_requests").create(pbFormData)

    return { success: true }
  } catch (error) {
    console.error("Failed to create trade-in request:", error)
    return {
      success: false,
      error: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.",
    }
  }
}
