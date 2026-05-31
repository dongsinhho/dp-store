import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import ProductFilters from "./ProductFilters"

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}))

describe("ProductFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset search params
    for (const key of [...mockSearchParams.keys()]) {
      mockSearchParams.delete(key)
    }
  })

  it("renders all filter controls", () => {
    render(<ProductFilters />)

    expect(screen.getByPlaceholderText("Tìm kiếm sản phẩm...")).toBeInTheDocument()
    expect(screen.getByLabelText("Danh mục")).toBeInTheDocument()
    expect(screen.getByText("Tình trạng")).toBeInTheDocument()
    expect(screen.getByLabelText("Giá tối thiểu")).toBeInTheDocument()
    expect(screen.getByLabelText("Giá tối đa")).toBeInTheDocument()
  })

  it("renders category options from props", () => {
    const categories = [
      { id: "cat1", name: "iPhone 15 Series", slug: "iphone-15-series" },
      { id: "cat2", name: "iPhone 14 Series", slug: "iphone-14-series" },
    ]

    render(<ProductFilters categories={categories} />)

    expect(screen.getByText("Tất cả danh mục")).toBeInTheDocument()
    expect(screen.getByText("iPhone 15 Series")).toBeInTheDocument()
    expect(screen.getByText("iPhone 14 Series")).toBeInTheDocument()
  })

  it("updates URL when category is selected", () => {
    const categories = [
      { id: "cat1", name: "iPhone 15 Series", slug: "iphone-15-series" },
    ]

    render(<ProductFilters categories={categories} />)

    fireEvent.change(screen.getByLabelText("Danh mục"), {
      target: { value: "cat1" },
    })

    expect(mockPush).toHaveBeenCalledWith("?category=cat1")
  })

  it("updates URL when condition toggle is clicked", () => {
    render(<ProductFilters />)

    fireEvent.click(screen.getByText("Mới"))
    expect(mockPush).toHaveBeenCalledWith("?condition=new")
  })

  it("updates URL when condition is set to used", () => {
    render(<ProductFilters />)

    fireEvent.click(screen.getByText("Cũ"))
    expect(mockPush).toHaveBeenCalledWith("?condition=used")
  })

  it("clears condition when 'Tất cả' is clicked", () => {
    mockSearchParams.set("condition", "new")
    render(<ProductFilters />)

    fireEvent.click(screen.getByText("Tất cả"))
    // Should push without condition param
    expect(mockPush).toHaveBeenCalledWith("?")
  })

  it("updates URL when search is submitted", () => {
    render(<ProductFilters />)

    const searchInput = screen.getByPlaceholderText("Tìm kiếm sản phẩm...")
    fireEvent.change(searchInput, { target: { value: "pro max" } })
    fireEvent.submit(searchInput.closest("form")!)

    expect(mockPush).toHaveBeenCalledWith("?search=pro+max")
  })

  it("shows validation error when min price exceeds max price", () => {
    render(<ProductFilters />)

    fireEvent.change(screen.getByLabelText("Giá tối thiểu"), {
      target: { value: "30000000" },
    })
    fireEvent.change(screen.getByLabelText("Giá tối đa"), {
      target: { value: "10000000" },
    })
    fireEvent.click(screen.getByText("Áp dụng giá"))

    expect(
      screen.getByText("Giá tối thiểu không được lớn hơn giá tối đa")
    ).toBeInTheDocument()
    // Should NOT update URL
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("updates URL when valid price range is applied", () => {
    render(<ProductFilters />)

    fireEvent.change(screen.getByLabelText("Giá tối thiểu"), {
      target: { value: "10000000" },
    })
    fireEvent.change(screen.getByLabelText("Giá tối đa"), {
      target: { value: "30000000" },
    })
    fireEvent.click(screen.getByText("Áp dụng giá"))

    expect(mockPush).toHaveBeenCalledWith(
      "?minPrice=10000000&maxPrice=30000000"
    )
  })

  it("shows clear filters button when filters are active", () => {
    mockSearchParams.set("category", "cat1")
    render(<ProductFilters />)

    expect(screen.getByText("Xóa bộ lọc")).toBeInTheDocument()
  })

  it("does not show clear filters button when no filters are active", () => {
    render(<ProductFilters />)

    expect(screen.queryByText("Xóa bộ lọc")).not.toBeInTheDocument()
  })

  it("clears all filters when clear button is clicked", () => {
    mockSearchParams.set("category", "cat1")
    mockSearchParams.set("condition", "new")
    render(<ProductFilters />)

    fireEvent.click(screen.getByText("Xóa bộ lọc"))

    expect(mockPush).toHaveBeenCalledWith("?")
  })

  it("clears price error when price inputs change", () => {
    render(<ProductFilters />)

    // Trigger error first
    fireEvent.change(screen.getByLabelText("Giá tối thiểu"), {
      target: { value: "30000000" },
    })
    fireEvent.change(screen.getByLabelText("Giá tối đa"), {
      target: { value: "10000000" },
    })
    fireEvent.click(screen.getByText("Áp dụng giá"))

    expect(
      screen.getByText("Giá tối thiểu không được lớn hơn giá tối đa")
    ).toBeInTheDocument()

    // Change min price - error should clear
    fireEvent.change(screen.getByLabelText("Giá tối thiểu"), {
      target: { value: "5000000" },
    })

    expect(
      screen.queryByText("Giá tối thiểu không được lớn hơn giá tối đa")
    ).not.toBeInTheDocument()
  })

  it("highlights active condition button", () => {
    mockSearchParams.set("condition", "new")
    render(<ProductFilters />)

    const newButtons = screen.getAllByText("Mới")
    // The first match is the condition toggle button
    const conditionButton = newButtons[0]
    expect(conditionButton.className).toContain("bg-[var(--color-primary)]")
  })
})
