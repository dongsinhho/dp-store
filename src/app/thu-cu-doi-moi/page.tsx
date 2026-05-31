"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Smartphone, ArrowRightLeft, CheckCircle, Upload, X, AlertCircle } from "lucide-react"
import { tradeInFormSchema } from "@/lib/validations"
import { validateFiles, type FileInfo, MAX_FILE_COUNT } from "@/lib/file-upload-validation"
import {
  submitTradeInRequest,
  getActiveProducts,
  type ActiveProduct,
  type TradeInRequestResult,
} from "./actions"
import AnimatedSection from "@/components/AnimatedSection"

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
  const [productSearch, setProductSearch] = useState("")
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ActiveProduct | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const productDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getActiveProducts().then(setProducts)
  }, [])

  // Close product dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    addFiles(files)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function addFiles(files: File[]) {
    setFileError(null)
    if (files.length === 0) return

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
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles])

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

    if (selectedProduct) {
      serverFormData.append("new_product", selectedProduct.id)
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

  // Success confirmation view
  if (submitResult?.success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="animate-fade-in-up">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        </div>
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
            setSelectedProduct(null)
            setProductSearch("")
            setFieldErrors({})
            setFileError(null)
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-105 font-medium shadow-medium"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* 3-Step Visual Guide */}
      <AnimatedSection>
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3 text-gray-900">Thu cũ đổi mới</h1>
          <p className="text-gray-600 mb-8">
            Đổi iPhone cũ lấy iPhone mới với giá ưu đãi. Quy trình đơn giản, định
            giá minh bạch.
          </p>

          {/* Steps - horizontal on desktop, vertical on mobile */}
          <div className="hidden md:flex items-center justify-between mb-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 font-bold text-lg">
                1
              </div>
              <Smartphone className="w-6 h-6 text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">Gửi thông tin</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-[160px]">
                Điền thông tin thiết bị cũ và chọn máy mới
              </p>
            </div>
            {/* Connector line */}
            <div className="flex-1 h-0.5 bg-gray-200 mx-2 max-w-[100px]" />
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 font-bold text-lg">
                2
              </div>
              <ArrowRightLeft className="w-6 h-6 text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">Định giá</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-[160px]">
                Nhân viên liên hệ và định giá thiết bị
              </p>
            </div>
            {/* Connector line */}
            <div className="flex-1 h-0.5 bg-gray-200 mx-2 max-w-[100px]" />
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 font-bold text-lg">
                3
              </div>
              <CheckCircle className="w-6 h-6 text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">Hoàn tất</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-[160px]">
                Xác nhận giá, gửi máy cũ và nhận máy mới
              </p>
            </div>
          </div>

          {/* Mobile vertical steps */}
          <div className="flex md:hidden flex-col items-start gap-0 mb-8">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  1
                </div>
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-gray-800 text-sm">Gửi thông tin</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Điền thông tin thiết bị cũ và chọn máy mới
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  2
                </div>
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-gray-800 text-sm">Định giá</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nhân viên liên hệ và định giá thiết bị
                </p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-gray-800 text-sm">Hoàn tất</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Xác nhận giá, gửi máy cũ và nhận máy mới
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Trade-in request form */}
      <AnimatedSection delay={100}>
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-subtle">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Gửi yêu cầu thu cũ đổi mới</h2>

          {/* Server error message with retry */}
          {submitResult?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{submitResult.error}</p>
                <button
                  type="button"
                  onClick={() => setSubmitResult(null)}
                  className="mt-2 text-sm text-red-600 underline hover:text-red-800 font-medium"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Customer info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${
                    fieldErrors.customer_name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nguyễn Văn A"
                />
                {fieldErrors.customer_name && (
                  <p className="mt-1.5 text-sm text-red-600 animate-fade-in">{fieldErrors.customer_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${
                    fieldErrors.customer_phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0912345678"
                />
                {fieldErrors.customer_phone && (
                  <p className="mt-1.5 text-sm text-red-600 animate-fade-in">{fieldErrors.customer_phone}</p>
                )}
              </div>
            </div>

            {/* Old device info */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Thông tin thiết bị cũ</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="old_device_model" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Model thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="old_device_model"
                    name="old_device_model"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${
                      fieldErrors.old_device_model ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="iPhone 13 Pro Max"
                  />
                  {fieldErrors.old_device_model && (
                    <p className="mt-1.5 text-sm text-red-600 animate-fade-in">{fieldErrors.old_device_model}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="old_device_storage" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Dung lượng <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="old_device_storage"
                    name="old_device_storage"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${
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
                    <p className="mt-1.5 text-sm text-red-600 animate-fade-in">{fieldErrors.old_device_storage}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="old_device_battery" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Dung lượng pin (%)
                </label>
                <input
                  type="number"
                  id="old_device_battery"
                  name="old_device_battery"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  placeholder="VD: 85"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="old_device_condition" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tình trạng thiết bị <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="old_device_condition"
                  name="old_device_condition"
                  rows={3}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-vertical ${
                    fieldErrors.old_device_condition ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Mô tả tình trạng máy: màn hình, vỏ, chức năng... (tối thiểu 10 ký tự)"
                />
                {fieldErrors.old_device_condition && (
                  <p className="mt-1.5 text-sm text-red-600 animate-fade-in">{fieldErrors.old_device_condition}</p>
                )}
              </div>
            </div>

            {/* New product selector with type-to-filter */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Sản phẩm muốn đổi (tùy chọn)</h3>

              <div ref={productDropdownRef} className="relative">
                <label htmlFor="product_search" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chọn sản phẩm mới
                </label>
                <input
                  type="text"
                  id="product_search"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setShowProductDropdown(true)
                    if (e.target.value === "") {
                      setSelectedProduct(null)
                    }
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  placeholder="Tìm kiếm sản phẩm..."
                  autoComplete="off"
                />
                {/* Hidden input for form submission */}
                <input type="hidden" name="new_product" value={selectedProduct?.id || ""} />

                {/* Dropdown */}
                {showProductDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-elevated max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null)
                        setProductSearch("")
                        setShowProductDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Chưa chọn sản phẩm
                    </button>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          type="button"
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product)
                            setProductSearch(product.name)
                            setShowProductDropdown(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors ${
                            selectedProduct?.id === product.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-800">{product.name}</span>
                          <span className="block text-xs text-blue-600 mt-0.5">{formatPrice(product.price)}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-400">
                        Không tìm thấy sản phẩm
                      </div>
                    )}
                  </div>
                )}

                {selectedProduct && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Đã chọn:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {selectedProduct.name} - {formatPrice(selectedProduct.price)}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null)
                          setProductSearch("")
                        }}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        aria-label="Bỏ chọn sản phẩm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>
                )}

                <p className="mt-1.5 text-xs text-gray-500">
                  Bạn có thể chọn sản phẩm muốn đổi hoặc để trống nếu chỉ muốn bán máy cũ.
                </p>
              </div>
            </div>

            {/* Image upload - dashed border, click + drag-and-drop */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Ảnh thiết bị cũ</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tải ảnh lên (tối đa {MAX_FILE_COUNT} ảnh, JPG/PNG, mỗi ảnh tối đa 5MB)
                </label>

                {/* File list */}
                {selectedFiles.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200"
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
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Xóa ${file.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drag and drop zone */}
                {selectedFiles.length < MAX_FILE_COUNT && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        fileInputRef.current?.click()
                      }
                    }}
                    aria-label="Khu vực tải ảnh lên"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium text-blue-600">Nhấn để chọn ảnh</span>{" "}
                      hoặc kéo thả vào đây
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG (tối đa 5MB/ảnh)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Tải ảnh thiết bị cũ"
                />

                {fileError && (
                  <p className="mt-2 text-sm text-red-600 animate-fade-in">{fileError}</p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-medium hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu thu cũ đổi mới"}
              </button>
            </div>
          </form>
        </div>
      </AnimatedSection>
    </div>
  )
}
