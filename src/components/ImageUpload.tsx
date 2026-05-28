"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, X } from "lucide-react"
import {
  validateFiles,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES as DEFAULT_MAX_SIZE,
  MAX_FILE_COUNT as DEFAULT_MAX_FILES,
  type FileInfo,
} from "@/lib/file-upload-validation"

export interface ImageUploadProps {
  /** Maximum number of files allowed. Defaults to 5. */
  maxFiles?: number
  /** Maximum file size in bytes. Defaults to 5MB. */
  maxSizeBytes?: number
  /** Callback when selected files change. */
  onChange?: (files: File[]) => void
  /** Label text displayed above the upload area. */
  label?: string
  /** Whether the upload area is disabled. */
  disabled?: boolean
}

/**
 * Reusable image upload component with client-side validation.
 * Validates file type (JPG/PNG only) and file size (max 5MB per file).
 * Shows specific error messages and allows retry on failure.
 *
 * Validates: Requirements 11.5, 12.3
 */
export default function ImageUpload({
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  onChange,
  label = "Tải ảnh lên",
  disabled = false,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate preview URLs for selected files
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file))
    setPreviews(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || [])
    setError(null)

    if (newFiles.length === 0) return

    const allFiles = [...selectedFiles, ...newFiles]

    // Check max file count
    if (allFiles.length > maxFiles) {
      setError(`Tối đa ${maxFiles} ảnh được phép tải lên.`)
      resetInput()
      return
    }

    // Validate each file individually for specific error messages
    for (const file of newFiles) {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
        setError("Chỉ chấp nhận ảnh JPG và PNG")
        resetInput()
        return
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        setError("Ảnh không được vượt quá 5MB")
        resetInput()
        return
      }
    }

    // Run full validation using the shared utility
    const fileInfos: FileInfo[] = allFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))

    const validation = validateFiles(fileInfos)
    if (!validation.valid) {
      setError(validation.errors.join(" "))
      resetInput()
      return
    }

    setSelectedFiles(allFiles)
    onChange?.(allFiles)
    resetInput()
  }

  function removeFile(index: number) {
    const updated = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(updated)
    setError(null)
    onChange?.(updated)
  }

  function resetInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      {/* Label and description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <p className="text-xs text-gray-500">
          Tối đa {maxFiles} ảnh, định dạng JPG/PNG, mỗi ảnh tối đa{" "}
          {Math.round(maxSizeBytes / (1024 * 1024))}MB
        </p>
      </div>

      {/* Preview thumbnails */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[index]}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                aria-label={`Xóa ${file.name}`}
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                <p className="text-[10px] text-white truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button / drop zone */}
      {selectedFiles.length < maxFiles && (
        <label
          className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg transition-colors ${
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <Upload className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Chọn ảnh để tải lên</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
            aria-label="Chọn ảnh để tải lên"
          />
        </label>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
