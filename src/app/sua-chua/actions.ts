"use server"

import { createServerPb } from "@/lib/pocketbase"
import { repairFormSchema } from "@/lib/validations"
import { validateFiles, type FileInfo } from "@/lib/file-upload-validation"

export interface RepairRequestResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

export async function submitRepairRequest(
  formData: FormData
): Promise<RepairRequestResult> {
  // Extract text fields
  const rawData = {
    customer_name: formData.get("customer_name") as string,
    customer_phone: formData.get("customer_phone") as string,
    device_model: formData.get("device_model") as string,
    issue_description: formData.get("issue_description") as string,
  }

  // Validate text fields with Zod
  const result = repairFormSchema.safeParse(rawData)
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

  // Extract and validate files
  const files = formData.getAll("images") as File[]
  const validFiles = files.filter((f) => f.size > 0) // Filter out empty file inputs

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

  // Create repair request in PocketBase
  try {
    const pb = createServerPb()

    const pbFormData = new FormData()
    pbFormData.append("customer_name", result.data.customer_name)
    pbFormData.append("customer_phone", result.data.customer_phone)
    pbFormData.append("device_model", result.data.device_model)
    pbFormData.append("issue_description", result.data.issue_description)
    pbFormData.append("status", "pending")

    for (const file of validFiles) {
      pbFormData.append("images", file)
    }

    await pb.collection("repair_requests").create(pbFormData)

    return { success: true }
  } catch (error) {
    console.error("Failed to create repair request:", error)
    return {
      success: false,
      error: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.",
    }
  }
}
