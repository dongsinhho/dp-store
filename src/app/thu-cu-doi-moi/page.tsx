"use client"

import { useState, useEffect, useRef } from "react"
import { Smartphone, ArrowRightLeft, CheckCircle, Upload, X } from "lucide-react"
import { tradeInFormSchema } from "@/lib/validations"
import { validateFiles, type FileInfo, MAX_FILE_COUNT } from "@/lib/file-upload-validation"
import {
  submitTradeInRequest,
  getActiveProducts,
  type ActiveProduct,
  type TradeInRequestResult,
} from "./actions"

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"]

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫"
}

export default function TradeInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<TradeInRequestResult | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [fileError, setFileError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [products, setProducts] = useState<ActiveProduct[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getActiveProducts().then(setProducts)
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setFileError(null)

    const allFiles = [...selectedFiles, ...files]
    if (allFiles.length > MAX_FILE_COUNT) {
      setFileError(`Tối đa ${MAX_FILE_COUNT} ảnh được phép tải lên.`)
      return
    }

    const fileInfos: FileInfo[] = allFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))

    const validation = validateFiles(fileInfos)
    if (!validation.valid) {
      setFileError(validation.errors.join(" "))
      return
    }

    setSelectedFiles(allFiles)
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setSubmitResult(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Client-side Zod validation
    const rawData = {
      customer_name: formData.get("customer_name") as string,
      customer_phone: formData.get("customer_phone") as string,
      old_device_model: formData.get("old_device_model") as string,
      old_device_storage: formData.get("old_device_storage") as string,
      old_device_condition: formData.get("old_device_condition") as string,
    }

    const validation = tradeInFormSchema.safeParse(rawData)
    if (!validation.success) {
      const errors: Record<string, string> = {}
      for (const issue of validation.error.issues) {
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

    setIsSubmitting(true)

    // Build FormData for server action
    const serverFormData = new FormData()
    serverFormData.append("customer_name", rawData.customer_name)
    serverFormData.append("customer_phone", rawData.customer_phone)
    serverFormData.append("old_device_model", rawData.old_device_model)
    serverFormData.append("old_device_storage", rawData.old_device_storage)
    serverFormData.append("old_device_condition", rawData.old_device_condition)

    const oldDeviceBattery = formData.get("old_device_battery") as string
    if (oldDeviceBattery) {
      serverFormData.append("old_device_battery", oldDeviceBattery)
    }

    const newProduct = formData.get("new_product") as string
    if (newProduct) {
      serverFormData.append("new_product", newProduct)
    }

    for (const file of selectedFiles) {
      serverFormData.append("old_device_images", file)
    }

    try {
      const result = await submitTradeInRequest(serverFormData)
      setSubmitResult(result)

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
    } catch {
      setSubmitResult({
        success: false,
        error: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show confirmation on success
  if (submitResult?.success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Gửi yêu cầu thành công!
        </h1>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Chúng tôi đã nhận được yêu cầu thu cũ đổi mới của bạn. Nhân viên sẽ
          liên hệ trong thời gian sớm nhất để định giá thiết bị.
        </p>
        <button
          onClick={() => {
            setSubmitResult(null)
            setSelectedFiles([])
            setFieldErrors({})
            setFileError(null)
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Trade-in service info section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Thu cũ đổi mới</h1>
        <p className="text-gray-600 mb-6">
          Đổi iPhone cũ lấy iPhone mới với giá ưu đãi. Quy trình đơn giản, định
          giá minh bạch.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center p-4 bg-gray-100 border border-gray-200 rounded-lg text-center">
            <Smartphone className="w-10 h-10 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Bước 1: Gửi thông tin</h3>
            <p className="text-sm text-gray-600">
              Điền thông tin thiết bị cũ và chọn máy mới muốn đổi (nếu có).
            </p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-100 border border-gray-200 rounded-lg text-center">
            <ArrowRightLeft className="w-10 h-10 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Bước 2: Định giá</h3>
            <p className="text-sm text-gray-600">
              Nhân viên sẽ liên hệ và định giá thiết bị cũ của bạn.
            </p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-100 border border-gray-200 rounded-lg text-center">
            <CheckCircle className="w-10 h-10 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Bước 3: Hoàn tất</h3>
            <p className="text-sm text-gray-600">
              Xác nhận giá, gửi máy cũ và nhận máy mới.
            </p>
          </div>
        </div>
      </div>

      {/* Trade-in request form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Gửi yêu cầu thu cũ đổi mới</h2>

        {submitResult?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {submitResult.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.customer_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nguyễn Văn A"
              />
              {fieldErrors.customer_name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.customer_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.customer_phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0912345678"
              />
              {fieldErrors.customer_phone && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.customer_phone}</p>
              )}
            </div>
          </div>

          {/* Old device info */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-medium mb-4">Thông tin thiết bị cũ</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="old_device_model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model thiết bị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="old_device_model"
                  name="old_device_model"
                  className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.old_device_model ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="iPhone 13 Pro Max"
                />
                {fieldErrors.old_device_model && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.old_device_model}</p>
                )}
              </div>

              <div>
                <label htmlFor="old_device_storage" className="block text-sm font-medium text-gray-700 mb-1">
                  Dung lượng <span className="text-red-500">*</span>
                </label>
                <select
                  id="old_device_storage"
                  name="old_device_storage"
                  className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.old_device_storage ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Chọn dung lượng</option>
                  {STORAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {fieldErrors.old_device_storage && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.old_device_storage}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="old_device_battery" className="block text-sm font-medium text-gray-700 mb-1">
                Dung lượng pin (%)
              </label>
              <input
                type="number"
                id="old_device_battery"
                name="old_device_battery"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 85"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="old_device_condition" className="block text-sm font-medium text-gray-700 mb-1">
                Tình trạng thiết bị <span className="text-red-500">*</span>
              </label>
              <textarea
                id="old_device_condition"
                name="old_device_condition"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.old_device_condition ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Mô tả tình trạng máy: màn hình, vỏ, chức năng... (tối thiểu 10 ký tự)"
              />
              {fieldErrors.old_device_condition && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.old_device_condition}</p>
              )}
            </div>
          </div>

          {/* New product selector */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-medium mb-4">Sản phẩm muốn đổi (tùy chọn)</h3>

            <div>
              <label htmlFor="new_product" className="block text-sm font-medium text-gray-700 mb-1">
                Chọn sản phẩm mới
              </label>
              <select
                id="new_product"
                name="new_product"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chưa chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatPrice(product.price)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Bạn có thể chọn sản phẩm muốn đổi hoặc để trống nếu chỉ muốn bán máy cũ.
              </p>
            </div>
          </div>

          {/* Image upload */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-medium mb-4">Ảnh thiết bị cũ</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tải ảnh lên (tối đa {MAX_FILE_COUNT} ảnh, JPG/PNG, mỗi ảnh tối đa 5MB)
              </label>

              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                    >
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Xóa ${file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length < MAX_FILE_COUNT && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-gray-100 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn ảnh</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFileChange}
                className="hidden"
                aria-label="Tải ảnh thiết bị cũ"
              />

              {fileError && (
                <p className="mt-2 text-sm text-red-600">{fileError}</p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="border-t pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu thu cũ đổi mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
