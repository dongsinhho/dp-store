/**
 * Property-based tests for file upload validation.
 *
 * Property 14: File upload validation
 * For any uploaded file, the System SHALL accept it only if the format is JPG or PNG
 * and the size does not exceed 5MB, rejecting all other files.
 *
 * **Validates: Requirements 11.1, 11.2**
 */

import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import {
  validateFileType,
  validateFileSize,
  validateFileCount,
  validateFile,
  validateFiles,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_COUNT,
  FileInfo,
} from "./file-upload-validation"

// --- Generators ---

/** Generates a valid file type (image/jpeg or image/png) */
const validFileTypeArb = fc.constantFrom("image/jpeg", "image/png")

/** Generates an invalid file type (anything not image/jpeg or image/png) */
const invalidFileTypeArb = fc
  .string({ minLength: 1 })
  .filter((t) => !(ALLOWED_FILE_TYPES as readonly string[]).includes(t))

/** Generates a valid file size (1 byte to 5MB inclusive) */
const validFileSizeArb = fc.integer({ min: 1, max: MAX_FILE_SIZE_BYTES })

/** Generates an invalid file size (exceeds 5MB) */
const invalidFileSizeArb = fc.integer({
  min: MAX_FILE_SIZE_BYTES + 1,
  max: MAX_FILE_SIZE_BYTES * 10,
})

/** Generates a file name */
const fileNameArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .map((s) => s.replace(/[/\\]/g, "_") + ".img")

/** Generates a valid file (valid type + valid size) */
const validFileArb: fc.Arbitrary<FileInfo> = fc.record({
  name: fileNameArb,
  type: validFileTypeArb,
  size: validFileSizeArb,
})

/** Generates a file with invalid type */
const invalidTypeFileArb: fc.Arbitrary<FileInfo> = fc.record({
  name: fileNameArb,
  type: invalidFileTypeArb,
  size: validFileSizeArb,
})

/** Generates a file with invalid size (exceeds 5MB) */
const invalidSizeFileArb: fc.Arbitrary<FileInfo> = fc.record({
  name: fileNameArb,
  type: validFileTypeArb,
  size: invalidFileSizeArb,
})

// --- Property Tests ---

describe("Property 14: File upload validation", () => {
  describe("File type validation", () => {
    it("always accepts files with valid types (image/jpeg, image/png)", () => {
      fc.assert(
        fc.property(validFileArb, (file) => {
          const result = validateFileType(file)
          expect(result.valid).toBe(true)
          expect(result.errors).toHaveLength(0)
        })
      )
    })

    it("always rejects files with invalid types", () => {
      fc.assert(
        fc.property(invalidTypeFileArb, (file) => {
          const result = validateFileType(file)
          expect(result.valid).toBe(false)
          expect(result.errors.length).toBeGreaterThan(0)
        })
      )
    })
  })

  describe("File size validation", () => {
    it("always accepts files within 5MB size limit", () => {
      fc.assert(
        fc.property(validFileArb, (file) => {
          const result = validateFileSize(file)
          expect(result.valid).toBe(true)
          expect(result.errors).toHaveLength(0)
        })
      )
    })

    it("always rejects files exceeding 5MB", () => {
      fc.assert(
        fc.property(invalidSizeFileArb, (file) => {
          const result = validateFileSize(file)
          expect(result.valid).toBe(false)
          expect(result.errors.length).toBeGreaterThan(0)
        })
      )
    })
  })

  describe("File count validation", () => {
    it("always accepts 1 to 5 files", () => {
      fc.assert(
        fc.property(
          fc.array(validFileArb, { minLength: 1, maxLength: MAX_FILE_COUNT }),
          (files) => {
            const result = validateFileCount(files)
            expect(result.valid).toBe(true)
            expect(result.errors).toHaveLength(0)
          }
        )
      )
    })

    it("always rejects more than 5 files", () => {
      fc.assert(
        fc.property(
          fc.array(validFileArb, {
            minLength: MAX_FILE_COUNT + 1,
            maxLength: MAX_FILE_COUNT + 10,
          }),
          (files) => {
            const result = validateFileCount(files)
            expect(result.valid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
          }
        )
      )
    })

    it("accepts empty file list (0 files)", () => {
      const result = validateFileCount([])
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe("Combined file validation", () => {
    it("always accepts files with valid type AND valid size", () => {
      fc.assert(
        fc.property(validFileArb, (file) => {
          const result = validateFile(file)
          expect(result.valid).toBe(true)
          expect(result.errors).toHaveLength(0)
        })
      )
    })

    it("always rejects files with invalid type regardless of size", () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fileNameArb,
            type: invalidFileTypeArb,
            size: fc.integer({ min: 1, max: MAX_FILE_SIZE_BYTES * 10 }),
          }),
          (file) => {
            const result = validateFile(file)
            expect(result.valid).toBe(false)
          }
        )
      )
    })

    it("always rejects files exceeding 5MB regardless of type", () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fileNameArb,
            type: fc.constantFrom("image/jpeg", "image/png", "application/pdf", "text/plain"),
            size: invalidFileSizeArb,
          }),
          (file) => {
            const result = validateFile(file)
            expect(result.valid).toBe(false)
          }
        )
      )
    })
  })

  describe("Batch file validation (validateFiles)", () => {
    it("always accepts a valid batch (1-5 files, all valid type and size)", () => {
      fc.assert(
        fc.property(
          fc.array(validFileArb, { minLength: 1, maxLength: MAX_FILE_COUNT }),
          (files) => {
            const result = validateFiles(files)
            expect(result.valid).toBe(true)
            expect(result.errors).toHaveLength(0)
          }
        )
      )
    })

    it("always rejects a batch with more than 5 files even if all are valid", () => {
      fc.assert(
        fc.property(
          fc.array(validFileArb, {
            minLength: MAX_FILE_COUNT + 1,
            maxLength: MAX_FILE_COUNT + 10,
          }),
          (files) => {
            const result = validateFiles(files)
            expect(result.valid).toBe(false)
          }
        )
      )
    })

    it("always rejects a batch containing at least one file with invalid type", () => {
      fc.assert(
        fc.property(
          fc.array(validFileArb, { minLength: 0, maxLength: MAX_FILE_COUNT - 1 }),
          invalidTypeFileArb,
          (validFiles, invalidFile) => {
            const files = [...validFiles, invalidFile]
            const result = validateFiles(files)
            expect(result.valid).toBe(false)
          }
        )
      )
    })

    it("always rejects a batch containing at least one file exceeding 5MB", () => {
      fc.assert(
        fc.property(
          fc.array(validFileArb, { minLength: 0, maxLength: MAX_FILE_COUNT - 1 }),
          invalidSizeFileArb,
          (validFiles, oversizedFile) => {
            const files = [...validFiles, oversizedFile]
            const result = validateFiles(files)
            expect(result.valid).toBe(false)
          }
        )
      )
    })
  })
})
