"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Custom fallback UI to display when an error is caught */
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary for catching render errors in child components.
 * Displays a maintenance/error message when PocketBase connection failures
 * or other render errors occur.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

/**
 * Default fallback UI shown when an error is caught.
 * Displays a maintenance message appropriate for PocketBase connection failures.
 */
function ErrorFallback({ error }: { error: Error | null }) {
  const isConnection =
    error?.message?.toLowerCase().includes("fetch") ||
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("connection")

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
        <svg
          className="w-12 h-12 text-yellow-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          {isConnection
            ? "Hệ thống đang bảo trì"
            : "Đã xảy ra lỗi"}
        </h2>
        <p className="text-yellow-700 text-sm">
          {isConnection
            ? "Hệ thống đang được bảo trì. Thông tin hiển thị có thể chưa cập nhật mới nhất. Vui lòng thử lại sau."
            : "Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang."}
        </p>
      </div>
    </div>
  )
}

export default ErrorBoundary
