"use client"

import { useState, useRef } from "react"
import { Wrench, CheckCircle, Upload, X, AlertCircle } from "lucide-react"
import { repairFormSchema } from "@/lib/validations"
import { validateFiles, type FileInfo, MAX_FILE_COUNT, MAX_FILE_SIZE_BYTES } from "@/lib/file-upload-validation"
import { submitRepairRequest } from "./actions"

const REPAIR_SERVICES = [
  {
    title: "Thay màn hình",
    description: "Thay thế màn hình bị vỡ, chết điểm ảnh hoặc lỗi cảm ứng",
  },
  {
    title: "Thay pin",
    description: "Thay pin mới cho máy chai pin, sụt pin nhanh",
  },
  {
    title: "Sửa lỗi phần mềm",
    description: "Khắc phục lỗi treo máy, đơ, khởi động lại liên tục",
  },
  {
    title: "Sửa lỗi camera",
    description: "Sửa camera bị mờ, không lấy nét, hoặc không hoạt động",
  },
  {
    title: "Thay loa / mic",
    description: "Sửa loa ngoài, loa trong hoặc mic bị hỏng",
  },
  {
    title: "Sửa nút nguồn / volume",
    description: "Khắc phục nút bấm bị liệt hoặc kẹt",
  },
]

export default function RepairPage() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState("")
  const [fileError, setFileError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setFileError("")

    if (files.length === 0) return

    const totalFiles = [...selectedFiles, ...files]

    // Validate files client-side
    const fileInfos: FileInfo[] = totalFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))

    const validation = validateFiles(fileInfos)
    if (!validation.valid) {
      setFileError(validation.errors.join(" "))
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setSelectedFiles(totalFiles)
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError("")
    setFileError("")

    const form = e.currentTarget
    const formData = new FormData(form)

    // Client-side Zod validation
    const rawData = {
      customer_name: formData.get("customer_name") as string,
      customer_phone: formData.get("customer_phone") as string,
      device_model: formData.get("device_model") as string,
      issue_description: formData.get("issue_description") as string,
    }

    const result = repairFormSchema.safeParse(rawData)
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    // Client-side file validation
    if (selectedFiles.length > 0) {
      const fileInfos: FileInfo[] = selectedFiles.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      }))

      const fileValidation = validateFiles(fileInfos)
      if (!fileValidation.valid) {
        setFileError(fileValidation.errors.join(" "))
        return
      }
    }

    // Disable button and submit
    setIsSubmitting(true)

    // Build FormData for server action
    const submitData = new FormData()
    submitData.append("customer_name", rawData.customer_name)
    submitData.append("customer_phone", rawData.customer_phone)
    submitData.append("device_model", rawData.device_model)
    submitData.append("issue_description", rawData.issue_description)

    for (const file of selectedFiles) {
      submitData.append("images", file)
    }

    const response = await submitRepairRequest(submitData)

    if (response.success) {
      setIsSuccess(true)
    } else {
      if (response.fieldErrors) {
        setFieldErrors(response.fieldErrors)
      }
      if (response.error) {
        setGeneralError(response.error)
      }
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Yêu cầu đã được gửi thành công!
        </h1>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Chúng tôi đã tiếp nhận yêu cầu sửa chữa của bạn. Đội ngũ kỹ thuật sẽ
          liên hệ với bạn trong thời gian sớm nhất.
        </p>
        <a
          href="/sua-chua"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Gửi yêu cầu khác
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Service info section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Dịch vụ sửa chữa iPhone
          </h1>
        </div>
        <p className="text-gray-600 mb-6">
          Chúng tôi cung cấp dịch vụ sửa chữa iPhone chuyên nghiệp với linh kiện
          chính hãng, bảo hành dài hạn. Kỹ thuật viên giàu kinh nghiệm, sửa chữa
          nhanh chóng.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {REPAIR_SERVICES.map((service) => (
            <div
              key={service.title}
              className="p-4 border rounded-lg bg-white shadow-sm"
            >
              <h3 className="font-semibold text-gray-800 mb-1">
                {service.title}
              </h3>
              <p className="text-sm text-gray-500">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Repair request form */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Gửi yêu cầu sửa chữa
        </h2>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Customer name */}
            <div>
              <label
                htmlFor="customer_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.customer_name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Nguyễn Văn A"
              />
              {fieldErrors.customer_name && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.customer_name}
                </p>
              )}
            </div>

            {/* Customer phone */}
            <div>
              <label
                htmlFor="customer_phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                maxLength={10}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.customer_phone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="0912345678"
              />
              {fieldErrors.customer_phone && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.customer_phone}
                </p>
              )}
            </div>

            {/* Device model */}
            <div>
              <label
                htmlFor="device_model"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Model thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="device_model"
                name="device_model"
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.device_model
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="iPhone 14 Pro Max"
              />
              {fieldErrors.device_model && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.device_model}
                </p>
              )}
            </div>

            {/* Issue description */}
            <div>
              <label
                htmlFor="issue_description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mô tả lỗi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issue_description"
                name="issue_description"
                rows={4}
                maxLength={1000}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                  fieldErrors.issue_description
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Mô tả chi tiết tình trạng lỗi của thiết bị (ít nhất 10 ký tự)"
              />
              {fieldErrors.issue_description && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.issue_description}
                </p>
              )}
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh thiết bị (tùy chọn)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Tối đa {MAX_FILE_COUNT} ảnh, định dạng JPG/PNG, mỗi ảnh tối đa{" "}
                {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB
              </p>

              {/* File list */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {file.name}{" "}
                        <span className="text-gray-400">
                          ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        aria-label={`Xóa ${file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length < MAX_FILE_COUNT && (
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Chọn ảnh để tải lên
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}

              {fileError && (
                <p className="mt-1 text-sm text-red-600">{fileError}</p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu sửa chữa"}
          </button>
        </form>
      </div>
    </div>
  )
}
