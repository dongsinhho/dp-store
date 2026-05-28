import { describe, it, expect, vi } from "vitest"
import {
  retryWithBackoff,
  calculateBackoffDelay,
  isConnectionError,
} from "./error-handling"

describe("calculateBackoffDelay", () => {
  const defaultOptions = { initialDelay: 1000, maxDelay: 30000, backoffFactor: 2 }

  it("returns initialDelay for first attempt", () => {
    expect(calculateBackoffDelay(1, defaultOptions)).toBe(1000)
  })

  it("doubles delay for each subsequent attempt", () => {
    expect(calculateBackoffDelay(2, defaultOptions)).toBe(2000)
    expect(calculateBackoffDelay(3, defaultOptions)).toBe(4000)
    expect(calculateBackoffDelay(4, defaultOptions)).toBe(8000)
    expect(calculateBackoffDelay(5, defaultOptions)).toBe(16000)
  })

  it("caps delay at maxDelay", () => {
    expect(calculateBackoffDelay(6, defaultOptions)).toBe(30000)
    expect(calculateBackoffDelay(10, defaultOptions)).toBe(30000)
  })
})

describe("retryWithBackoff", () => {
  it("returns result on first successful attempt", async () => {
    const fn = vi.fn().mockResolvedValue("success")
    const result = await retryWithBackoff(fn)
    expect(result).toBe("success")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("retries on failure and returns on eventual success", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValue("success")

    const result = await retryWithBackoff(fn, {
      initialDelay: 10,
      maxDelay: 100,
      maxAttempts: 5,
    })

    expect(result).toBe("success")
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it("throws last error after all attempts exhausted", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"))

    await expect(
      retryWithBackoff(fn, {
        initialDelay: 10,
        maxDelay: 50,
        maxAttempts: 3,
      })
    ).rejects.toThrow("always fails")

    expect(fn).toHaveBeenCalledTimes(3)
  })

  it("calls onRetry callback with attempt info", async () => {
    const onRetry = vi.fn()
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("ok")

    await retryWithBackoff(fn, {
      initialDelay: 10,
      maxDelay: 100,
      maxAttempts: 5,
      onRetry,
    })

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith(1, 10, expect.any(Error))
  })

  it("respects maxAttempts of 10 by default", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"))

    await expect(
      retryWithBackoff(fn, { initialDelay: 1, maxDelay: 5 })
    ).rejects.toThrow("fail")

    expect(fn).toHaveBeenCalledTimes(10)
  })
})

describe("isConnectionError", () => {
  it("detects TypeError with fetch message", () => {
    expect(isConnectionError(new TypeError("Failed to fetch"))).toBe(true)
  })

  it("detects network errors", () => {
    expect(isConnectionError(new Error("Network error"))).toBe(true)
  })

  it("detects ECONNREFUSED errors", () => {
    expect(isConnectionError(new Error("ECONNREFUSED"))).toBe(true)
  })

  it("detects timeout errors", () => {
    expect(isConnectionError(new Error("Request timeout"))).toBe(true)
  })

  it("returns false for non-connection errors", () => {
    expect(isConnectionError(new Error("Validation failed"))).toBe(false)
  })

  it("returns false for non-Error values", () => {
    expect(isConnectionError("string error")).toBe(false)
    expect(isConnectionError(null)).toBe(false)
    expect(isConnectionError(undefined)).toBe(false)
  })
})
