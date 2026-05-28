import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import ImageUpload from "./ImageUpload"

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn((file: File) => `blob:${file.name}`)
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.URL.createObjectURL = mockCreateObjectURL
  globalThis.URL.revokeObjectURL = mockRevokeObjectURL
})

function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const content = new Array(size).fill("a").join("")
  return new File([content], name, { type })
}

describe("ImageUpload", () => {
  it("renders upload area with default label", () => {
    render(<ImageUpload />)

    expect(screen.getByText("Tải ảnh lên")).toBeInTheDocument()
    expect(screen.getByText("Chọn ảnh để tải lên")).toBeInTheDocument()
  })

  it("renders with custom label", () => {
    render(<ImageUpload label="Ảnh thiết bị" />)

    expect(screen.getByText("Ảnh thiết bị")).toBeInTheDocument()
  })

  it("shows description with max files and size info", () => {
    render(<ImageUpload maxFiles={3} maxSizeBytes={2 * 1024 * 1024} />)

    expect(
      screen.getByText(/Tối đa 3 ảnh, định dạng JPG\/PNG, mỗi ảnh tối đa 2MB/)
    ).toBeInTheDocument()
  })

  it("accepts valid JPG files", async () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const file = createMockFile("photo.jpg", 1024, "image/jpeg")
    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([file])
    })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("accepts valid PNG files", async () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const file = createMockFile("screenshot.png", 2048, "image/png")
    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([file])
    })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows error for invalid file type", () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const file = createMockFile("document.pdf", 1024, "application/pdf")
    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Chỉ chấp nhận ảnh JPG và PNG"
    )
    expect(onChange).not.toHaveBeenCalled()
  })

  it("shows error for file exceeding 5MB", () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const file = createMockFile(
      "large-photo.jpg",
      6 * 1024 * 1024,
      "image/jpeg"
    )
    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Ảnh không được vượt quá 5MB"
    )
    expect(onChange).not.toHaveBeenCalled()
  })

  it("shows error when exceeding max file count", async () => {
    const onChange = vi.fn()
    render(<ImageUpload maxFiles={2} onChange={onChange} />)

    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    // Add 3 files at once (exceeds max of 2)
    const files = [
      createMockFile("a.jpg", 1024, "image/jpeg"),
      createMockFile("b.jpg", 1024, "image/jpeg"),
      createMockFile("c.jpg", 1024, "image/jpeg"),
    ]

    fireEvent.change(input, { target: { files } })

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tối đa 2 ảnh được phép tải lên"
    )
    expect(onChange).not.toHaveBeenCalled()
  })

  it("displays preview thumbnails for selected files", async () => {
    render(<ImageUpload />)

    const file = createMockFile("photo.jpg", 1024, "image/jpeg")
    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument()
    })
  })

  it("removes a file when remove button is clicked", async () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const file = createMockFile("photo.jpg", 1024, "image/jpeg")
    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument()
    })

    const removeButton = screen.getByLabelText("Xóa photo.jpg")
    fireEvent.click(removeButton)

    expect(screen.queryByAltText("photo.jpg")).not.toBeInTheDocument()
    // onChange called with empty array after removal
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it("clears error when user selects valid files after an error", async () => {
    render(<ImageUpload />)

    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    // First, trigger an error
    const invalidFile = createMockFile("doc.pdf", 1024, "application/pdf")
    fireEvent.change(input, { target: { files: [invalidFile] } })
    expect(screen.getByRole("alert")).toBeInTheDocument()

    // Then, select a valid file
    const validFile = createMockFile("photo.jpg", 1024, "image/jpeg")
    fireEvent.change(input, { target: { files: [validFile] } })

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("retains previously selected files when new upload fails validation", async () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    // Add a valid file first
    const validFile = createMockFile("photo.jpg", 1024, "image/jpeg")
    fireEvent.change(input, { target: { files: [validFile] } })

    await waitFor(() => {
      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument()
    })

    // Try to add an invalid file
    const invalidFile = createMockFile("doc.pdf", 1024, "application/pdf")
    fireEvent.change(input, { target: { files: [invalidFile] } })

    // Error is shown
    expect(screen.getByRole("alert")).toBeInTheDocument()
    // But the previously selected file is still there
    expect(screen.getByAltText("photo.jpg")).toBeInTheDocument()
  })

  it("hides upload area when max files reached", async () => {
    render(<ImageUpload maxFiles={1} />)

    const file = createMockFile("photo.jpg", 1024, "image/jpeg")
    const input = screen.getByLabelText("Chọn ảnh để tải lên")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument()
    })

    // Upload area should be hidden
    expect(screen.queryByText("Chọn ảnh để tải lên")).not.toBeInTheDocument()
  })

  it("disables input when disabled prop is true", () => {
    render(<ImageUpload disabled />)

    const input = screen.getByLabelText("Chọn ảnh để tải lên")
    expect(input).toBeDisabled()
  })
})
