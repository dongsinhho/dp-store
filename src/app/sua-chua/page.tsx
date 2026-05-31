"use client"

import { useState, useRef, useCallback } from "react"
import { Wrench, Upload, X, AlertCircle, Smartphone, Battery, Cpu, Camera, Volume2, Power } from "lucide-react"
import { repairFormSchema } from "@/lib/validations"
import { validateFiles, type FileInfo, MAX_FILE_COUNT, MAX_FILE_SIZE_BYTES } from "@/lib/file-upload-validation"
import { submitRepairRequest } from "./actions"

const REPAIR_SERVICES = [
  {
    title: "Thay màn hình",
    description: "Thay thế màn hình bị vỡ, chết điểm ảnh hoặc lỗi cảm ứng",
    icon: Smartphone,
  },
  {
    title: "Thay pin",
    description: "Thay pin mới cho máy chai pin, sụt pin nhanh",
    icon: Battery,
  },
  {
    title: "Sửa lỗi phần mềm",
    description: "Khắc phục lỗi treo máy, đơ, khởi động lại liên tục",
    icon: Cpu,
  },
  {
    title: "Sửa lỗi camera",
    description: "Sửa camera bị mờ, không lấy nét, hoặc không hoạt động",
    icon: Camera,
  },
  {
    title: "Thay loa / mic",
    description: "Sửa loa ngoài, loa trong hoặc mic bị hỏng",
    icon: Volume2,
  },
  {
    title: "Sửa nút nguồn / volume",
    description: "Khắc phục nút bấm bị liệt hoặc kẹt",
    icon: Power,
  },
]

/** Animated checkmark SVG for success confirmation */
function AnimatedCheckmark() {
  return (
    <div className="animate-scale-in">
      <svg
        className="w-20 h-20"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="var(--color-success)"
          strokeWidth="4"
          strokeDasharray="283"
          strokeDashoffset="0"
          className="animate-[checkmark-circle_500ms_ease-out_forwards]"
          fill="none"
        />
        <path
          d="M30 52 L44 66 L70 38"
          stroke="var(--color-success)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          strokeDashoffset="0"
          className="animate-[checkmark-draw_400ms_ease-out_200ms_forwards]"
          fill="none"
        />
      </svg>
    </div>
  )
}

/** Inline error message with slide-down animation */
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-sm text-[var(--color-error)] animate-slide-down overflow-hidden">
      {message}
    </p>
  )
}

export default function RepairPage() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState("")
  const [fileError, setFileError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setFileError("")

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const totalFiles = [...selectedFiles, ...files]

    const fileInfos: FileInfo[] = totalFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))

    const validation = validateFiles(fileInfos)
    if (!validation.valid) {
      setFileError(validation.errors.join(" "))
      return
    }

    setSelectedFiles(totalFiles)
  }, [selectedFiles])

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

  // Input field base classes (matching checkout page pattern)
  const inputBaseClass =
    "w-full px-4 py-3 border rounded-[var(--radius-md)] bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
  const inputErrorClass = "border-[var(--color-error)] focus:ring-[var(--color-error)] focus:border-[var(--color-error)]"
  const inputNormalClass = "border-gray-300"

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <AnimatedCheckmark />
        <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-2 animate-fade-in">
          Yêu cầu đã được gửi thành công!
        </h1>
        <p className="text-gray-600 mb-6 text-center max-w-md animate-fade-in">
          Chúng tôi đã tiếp nhận yêu cầu sửa chữa của bạn. Đội ngũ kỹ thuật sẽ
          liên hệ với bạn trong thời gian sớm nhất.
        </p>
        <a
          href="/sua-chua"
          className="bg-gradient-to-r from-[var(--color-primary)] to-blue-700 text-white px-6 py-3 rounded-[var(--radius-md)] hover:opacity-90 transition-all duration-200 font-medium shadow-medium animate-fade-in"
        >
          Gửi yêu cầu khác
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Service info section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-[var(--radius-md)]">
            <Wrench className="w-7 h-7 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dịch vụ sửa chữa iPhone
          </h1>
        </div>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Chúng tôi cung cấp dịch vụ sửa chữa iPhone chuyên nghiệp với linh kiện
          chính hãng, bảo hành dài hạn. Kỹ thuật viên giàu kinh nghiệm, sửa chữa
          nhanh chóng.
        </p>

        {/* Service cards grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {REPAIR_SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className="group p-5 bg-white border border-gray-200 rounded-[var(--radius-lg)] shadow-subtle hover:shadow-medium transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-[var(--radius-md)] text-[var(--color-primary)] group-hover:bg-blue-100 transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Repair request form */}
      <div className="bg-white border border-gray-200 rounded-[var(--radius-lg)] p-6 md:p-8 shadow-subtle">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          Gửi yêu cầu sửa chữa
        </h2>

        {generalError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-[var(--radius-md)] flex items-start gap-3 animate-slide-down">
            <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">
            {/* Customer name */}
            <div>
              <label
                htmlFor="customer_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Họ và tên <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                maxLength={100}
                className={`${inputBaseClass} ${
                  fieldErrors.customer_name ? inputErrorClass : inputNormalClass
                }`}
                placeholder="Nguyễn Văn A"
              />
              <FieldError message={fieldErrors.customer_name} />
            </div>

            {/* Customer phone */}
            <div>
              <label
                htmlFor="customer_phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Số điện thoại <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                maxLength={10}
                className={`${inputBaseClass} ${
                  fieldErrors.customer_phone ? inputErrorClass : inputNormalClass
                }`}
                placeholder="0912345678"
              />
              <FieldError message={fieldErrors.customer_phone} />
            </div>

            {/* Device model */}
            <div>
              <label
                htmlFor="device_model"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Model thiết bị <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                id="device_model"
                name="device_model"
                maxLength={100}
                className={`${inputBaseClass} ${
                  fieldErrors.device_model ? inputErrorClass : inputNormalClass
                }`}
                placeholder="iPhone 14 Pro Max"
              />
              <FieldError message={fieldErrors.device_model} />
            </div>

            {/* Issue description */}
            <div>
              <label
                htmlFor="issue_description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mô tả lỗi <span className="text-[var(--color-error)]">*</span>
              </label>
              <textarea
                id="issue_description"
                name="issue_description"
                rows={4}
                maxLength={1000}
                className={`${inputBaseClass} resize-vertical ${
                  fieldErrors.issue_description ? inputErrorClass : inputNormalClass
                }`}
                placeholder="Mô tả chi tiết tình trạng lỗi của thiết bị (ít nhất 10 ký tự)"
              />
              <FieldError message={fieldErrors.issue_description} />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh thiết bị <span className="text-gray-400 font-normal">(tùy chọn)</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Tối đa {MAX_FILE_COUNT} ảnh, định dạng JPG/PNG, mỗi ảnh tối đa{" "}
                {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB
              </p>

              {/* File list */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-[var(--radius-sm)] border border-gray-100"
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
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-[var(--radius-sm)] transition-colors duration-150"
                        aria-label={`Xóa ${file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Dashed upload area with drag-over state */}
              {selectedFiles.length < MAX_FILE_COUNT && (
                <label
                  className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-[var(--radius-md)] cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? "border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]"
                      : "border-gray-300 hover:border-[var(--color-primary)] hover:bg-gray-50 text-gray-500"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`w-8 h-8 ${isDragOver ? "text-[var(--color-primary)]" : "text-gray-400"}`} />
                  <span className="text-sm font-medium">
                    {isDragOver ? "Thả ảnh vào đây" : "Kéo thả hoặc nhấn để chọn ảnh"}
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG — tối đa {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB mỗi ảnh
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
                <FieldError message={fileError} />
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-700 text-white py-3.5 px-6 rounded-[var(--radius-md)] font-semibold hover:opacity-90 hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu sửa chữa"}
          </button>
        </form>
      </div>
    </div>
  )
}
