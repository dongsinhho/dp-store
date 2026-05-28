"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { pb } from "@/lib/pocketbase"
import { calculateBackoffDelay } from "@/lib/error-handling"

/**
 * Client component that monitors PocketBase connectivity.
 * Shows a maintenance banner when connection is lost and auto-removes
 * it within 3 seconds when reconnected.
 */
export default function ConnectionStatus() {
  const [isDisconnected, setIsDisconnected] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const attemptRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Use PocketBase health check endpoint
      await pb.health.check()
      return true
    } catch {
      return false
    }
  }, [])

  const startRetrying = useCallback(() => {
    if (timerRef.current) return // Already retrying

    const retry = async () => {
      attemptRef.current += 1
      const attempt = attemptRef.current

      const connected = await checkConnection()

      if (connected) {
        // Connection restored - hide banner within 3 seconds
        attemptRef.current = 0
        setIsDisconnected(false)

        // Remove banner with a short delay (within 3s requirement)
        bannerTimerRef.current = setTimeout(() => {
          setShowBanner(false)
        }, 1000)
        return
      }

      // Still disconnected - schedule next retry with backoff
      if (attempt < 10) {
        const delay = calculateBackoffDelay(attempt, {
          initialDelay: 1000,
          maxDelay: 30000,
          backoffFactor: 2,
        })
        timerRef.current = setTimeout(retry, delay)
      }
    }

    retry()
  }, [checkConnection])

  useEffect(() => {
    // Periodic health check every 30 seconds
    const intervalId = setInterval(async () => {
      const connected = await checkConnection()

      if (!connected && !isDisconnected) {
        setIsDisconnected(true)
        setShowBanner(true)
        startRetrying()
      }
    }, 30000)

    // Initial check on mount
    checkConnection().then((connected) => {
      if (!connected) {
        setIsDisconnected(true)
        setShowBanner(true)
        startRetrying()
      }
    })

    return () => {
      clearInterval(intervalId)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (bannerTimerRef.current) {
        clearTimeout(bannerTimerRef.current)
      }
    }
  }, [checkConnection, isDisconnected, startRetrying])

  if (!showBanner) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-3 text-center text-sm font-medium shadow-md"
    >
      <div className="flex items-center justify-center gap-2">
        <svg
          className="w-5 h-5 flex-shrink-0"
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
        <span>
          Hệ thống đang bảo trì. Thông tin hiển thị có thể chưa cập nhật mới nhất.
        </span>
      </div>
    </div>
  )
}
