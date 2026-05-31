import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import PageTransition from "./PageTransition";

describe("PageTransition", () => {
  beforeEach(() => {
    // Default: no reduced motion preference
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders children correctly", () => {
    render(
      <PageTransition>
        <p>Hello World</p>
      </PageTransition>
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies animate-fade-in class when motion is allowed", async () => {
    const { container } = render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>
    );

    // Wait for useEffect to run
    await vi.waitFor(() => {
      expect(container.firstChild).toHaveClass("animate-fade-in");
    });
  });

  it("does not apply animation class when prefers-reduced-motion is set", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { container } = render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>
    );

    // Wait a tick for useEffect
    await vi.waitFor(() => {
      expect(container.firstChild).not.toHaveClass("animate-fade-in");
    });
  });

  it("does not cause layout shift (wrapper is a plain div)", () => {
    const { container } = render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe("DIV");
  });
});
