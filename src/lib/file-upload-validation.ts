/**
 * File upload validation utilities for image uploads.
 * Validates file type (JPG/PNG only), file size (max 5MB), and file count (max 5).
 *
 * Validates: Requirements 11.1, 11.2
 */

export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"] as const
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
export const MAX_FILE_COUNT = 5

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number]

export interface FileValidationResult {
  valid: boolean
  errors: string[]
}

export interface FileInfo {
  name: string
  type: string
  size: number
}

/**
 * Validates a single file's type.
 * Only JPG (image/jpeg) and PNG (image/png) are accepted.
 */
export function validateFileType(file: FileInfo): FileValidationResult {
  if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
    return {
      valid: false,
      errors: [
        `File "${file.name}" has invalid format. Only JPG and PNG are accepted.`,
      ],
    }
  }
  return { valid: true, errors: [] }
}

/**
 * Validates a single file's size.
 * Maximum allowed size is 5MB per file.
 */
export function validateFileSize(file: FileInfo): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      errors: [
        `File "${file.name}" exceeds the maximum allowed size of 5MB.`,
      ],
    }
  }
  return { valid: true, errors: [] }
}

/**
 * Validates the number of files.
 * Maximum 5 files per request.
 */
export function validateFileCount(files: FileInfo[]): FileValidationResult {
  if (files.length > MAX_FILE_COUNT) {
    return {
      valid: false,
      errors: [
        `Too many files. Maximum ${MAX_FILE_COUNT} files allowed, but ${files.length} were provided.`,
      ],
    }
  }
  return { valid: true, errors: [] }
}

/**
 * Validates a single file (type + size).
 */
export function validateFile(file: FileInfo): FileValidationResult {
  const errors: string[] = []

  const typeResult = validateFileType(file)
  if (!typeResult.valid) {
    errors.push(...typeResult.errors)
  }

  const sizeResult = validateFileSize(file)
  if (!sizeResult.valid) {
    errors.push(...sizeResult.errors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validates a collection of files (count + individual type/size).
 */
export function validateFiles(files: FileInfo[]): FileValidationResult {
  const errors: string[] = []

  const countResult = validateFileCount(files)
  if (!countResult.valid) {
    errors.push(...countResult.errors)
  }

  for (const file of files) {
    const fileResult = validateFile(file)
    if (!fileResult.valid) {
      errors.push(...fileResult.errors)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
