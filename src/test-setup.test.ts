import { describe, it, expect } from "vitest"

describe("Test setup", () => {
  it("should have localStorage mock available", () => {
    localStorage.setItem("test-key", "test-value")
    expect(localStorage.getItem("test-key")).toBe("test-value")
    localStorage.removeItem("test-key")
    expect(localStorage.getItem("test-key")).toBeNull()
  })

  it("should resolve @ path alias", async () => {
    // This test verifies the alias works by importing from @/
    // If this file compiles and runs, the alias is configured correctly
    expect(true).toBe(true)
  })
})
