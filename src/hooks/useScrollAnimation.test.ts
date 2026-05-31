import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useScrollAnimation } from "./useScrollAnimation"

// Store observer callbacks and instances for test control
let observerCallback: IntersectionObserverCallback | null = null
let observerOptions: IntersectionObserverInit | undefined
const mockObserveFunc = vi.fn()
const mockUnobserveFunc = vi.fn()
const mockDisconnectFunc = vi.fn()

class MockIntersectionObserver {
  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    observerCallback = callback
    observerOptions = options
  }

  observe(target: Element) {
    mockObserveFunc(target)
  }
  unobserve(target: Element) {
    mockUnobserveFunc(target)
  }
  disconnect() {
    mockDisconnectFunc()
  }
  takeRecords() {
    return []
  }
  root = null
  rootMargin = ""
  thresholds = [] as number[]
}

describe("useScrollAnimation", () => {
  let matchMediaMock: ReturnType<typeof vi.fn>
  let originalIO: typeof IntersectionObserver

  beforeEach(() => {
    originalIO = globalThis.IntersectionObserver
    observerCallback = null
    observerOptions = undefined
    mockObserveFunc.mockClear()
    mockUnobserveFunc.mockClear()
    mockDisconnectFunc.mockClear()

    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver

    matchMediaMock = vi.fn().mockReturnValue({ matches: false })
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    })
  })

  afterEach(() => {
    globalThis.IntersectionObserver = originalIO
    vi.restoreAllMocks()
  })

  it("should return isVisible false initially when motion is allowed", () => {
    const { result } = renderHook(() => useScrollAnimation())
    expect(result.current.isVisible).toBe(false)
  })

  it("should return a callback ref function", () => {
    const { result } = renderHook(() => useScrollAnimation())
    expect(typeof result.current.ref).toBe("function")
  })

  it("should observe the element when ref callback is called with a node", () => {
    const div = document.createElement("div")
    const { result } = renderHook(() => useScrollAnimation())

    act(() => {
      result.current.ref(div)
    })

    expect(mockObserveFunc).toHaveBeenCalledWith(div)
  })

  it("should create IntersectionObserver with default options", () => {
    const div = document.createElement("div")
    const { result } = renderHook(() => useScrollAnimation())

    act(() => {
      result.current.ref(div)
    })

    expect(observerOptions).toEqual({
      threshold: 0.1,
      rootMargin: "0px",
    })
  })

  it("should create IntersectionObserver with custom options", () => {
    const div = document.createElement("div")
    const { result } = renderHook(() =>
      useScrollAnimation({ threshold: 0.5, rootMargin: "20px" })
    )

    act(() => {
      result.current.ref(div)
    })

    expect(observerOptions).toEqual({
      threshold: 0.5,
      rootMargin: "20px",
    })
  })

  it("should set isVisible to true when element intersects", () => {
    const div = document.createElement("div")
    const { result } = renderHook(() => useScrollAnimation())

    act(() => {
      result.current.ref(div)
    })

    expect(observerCallback).not.toBeNull()

    act(() => {
      observerCallback!(
        [{ isIntersecting: true, target: div } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(result.current.isVisible).toBe(true)
  })

  it("should unobserve after first intersection when triggerOnce is true (default)", () => {
    const div = document.createElement("div")
    const { result } = renderHook(() =>
      useScrollAnimation({ triggerOnce: true })
    )

    act(() => {
      result.current.ref(div)
    })

    act(() => {
      observerCallback!(
        [{ isIntersecting: true, target: div } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(mockUnobserveFunc).toHaveBeenCalledWith(div)
  })

  it("should not unobserve when triggerOnce is false", () => {
    const div = document.createElement("div")
    const { result } = renderHook(() =>
      useScrollAnimation({ triggerOnce: false })
    )

    act(() => {
      result.current.ref(div)
    })

    act(() => {
      observerCallback!(
        [{ isIntersecting: true, target: div } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(mockUnobserveFunc).not.toHaveBeenCalled()
  })

  it("should set isVisible back to false when element leaves viewport with triggerOnce false", () => {
    const div = document.createElement("div")
    const { result } = renderHook(() =>
      useScrollAnimation({ triggerOnce: false })
    )

    act(() => {
      result.current.ref(div)
    })

    // Element enters viewport
    act(() => {
      observerCallback!(
        [{ isIntersecting: true, target: div } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })
    expect(result.current.isVisible).toBe(true)

    // Element leaves viewport
    act(() => {
      observerCallback!(
        [{ isIntersecting: false, target: div } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })
    expect(result.current.isVisible).toBe(false)
  })

  it("should return isVisible true immediately when prefers-reduced-motion is reduce", () => {
    matchMediaMock.mockReturnValue({ matches: true })

    const { result } = renderHook(() => useScrollAnimation())
    expect(result.current.isVisible).toBe(true)
  })

  it("should not create IntersectionObserver when prefers-reduced-motion is reduce", () => {
    matchMediaMock.mockReturnValue({ matches: true })

    const div = document.createElement("div")
    const { result } = renderHook(() => useScrollAnimation())

    act(() => {
      result.current.ref(div)
    })

    // Observer should not have been used to observe the element
    // because shouldSkipAnimation is true
    expect(mockObserveFunc).not.toHaveBeenCalled()
  })

  it("should return isVisible true when IntersectionObserver is unavailable", () => {
    // @ts-expect-error - intentionally removing for test
    delete globalThis.IntersectionObserver

    const { result } = renderHook(() => useScrollAnimation())
    expect(result.current.isVisible).toBe(true)
  })

  it("should disconnect observer when ref is called with null", () => {
    const div = document.createElement("div")
    const { result } = renderHook(() => useScrollAnimation())

    act(() => {
      result.current.ref(div)
    })

    act(() => {
      result.current.ref(null)
    })

    expect(mockDisconnectFunc).toHaveBeenCalled()
  })

  it("should disconnect observer on unmount via cleanup effect", () => {
    const div = document.createElement("div")
    const { result, unmount } = renderHook(() => useScrollAnimation())

    act(() => {
      result.current.ref(div)
    })

    unmount()
    expect(mockDisconnectFunc).toHaveBeenCalled()
  })
})
