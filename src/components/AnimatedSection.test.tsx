import { render, screen } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import AnimatedSection from "./AnimatedSection"

// Mock the useScrollAnimation hook
vi.mock("@/hooks/useScrollAnimation", () => ({
  useScrollAnimation: vi.fn(),
}))

import { useScrollAnimation } from "@/hooks/useScrollAnimation"
const mockUseScrollAnimation = vi.mocked(useScrollAnimation)

describe("AnimatedSection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders children correctly", () => {
    mockUseScrollAnimation.mockReturnValue({
      ref: vi.fn(),
      isVisible: false,
    })

    render(
      <AnimatedSection>
        <p>Hello World</p>
      </AnimatedSection>
    )
    expect(screen.getByText("Hello World")).toBeInTheDocument()
  })

  it("applies opacity-0 class when not visible", () => {
    mockUseScrollAnimation.mockReturnValue({
      ref: vi.fn(),
      isVisible: false,
    })

    const { container } = render(
      <AnimatedSection>
        <p>Content</p>
      </AnimatedSection>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass("opacity-0")
    expect(wrapper).not.toHaveClass("animate-fade-in-up")
  })

  it("applies animate-fade-in-up class when visible", () => {
    mockUseScrollAnimation.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    })

    const { container } = render(
      <AnimatedSection>
        <p>Content</p>
      </AnimatedSection>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass("animate-fade-in-up")
    expect(wrapper).not.toHaveClass("opacity-0")
  })

  it("passes custom className to the wrapper", () => {
    mockUseScrollAnimation.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    })

    const { container } = render(
      <AnimatedSection className="mt-8 custom-class">
        <p>Content</p>
      </AnimatedSection>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass("mt-8")
    expect(wrapper).toHaveClass("custom-class")
  })

  it("applies animationDelay style when delay prop is provided", () => {
    mockUseScrollAnimation.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    })

    const { container } = render(
      <AnimatedSection delay={200}>
        <p>Content</p>
      </AnimatedSection>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ animationDelay: "200ms" })
  })

  it("does not apply animationDelay when delay is 0", () => {
    mockUseScrollAnimation.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    })

    const { container } = render(
      <AnimatedSection delay={0}>
        <p>Content</p>
      </AnimatedSection>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.animationDelay).toBe("")
  })

  it("calls useScrollAnimation with threshold 0.1", () => {
    mockUseScrollAnimation.mockReturnValue({
      ref: vi.fn(),
      isVisible: false,
    })

    render(
      <AnimatedSection>
        <p>Content</p>
      </AnimatedSection>
    )

    expect(mockUseScrollAnimation).toHaveBeenCalledWith({ threshold: 0.1 })
  })

  it("attaches the ref from useScrollAnimation to the wrapper div", () => {
    const mockRef = vi.fn()
    mockUseScrollAnimation.mockReturnValue({
      ref: mockRef,
      isVisible: false,
    })

    render(
      <AnimatedSection>
        <p>Content</p>
      </AnimatedSection>
    )

    expect(mockRef).toHaveBeenCalled()
  })
})
