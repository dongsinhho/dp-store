/**
 * Error handling utilities for PocketBase connection resilience.
 * Provides exponential backoff retry logic for network operations.
 */

export interface RetryOptions {
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number
  /** Maximum number of retry attempts (default: 10) */
  maxAttempts?: number
  /** Multiplier for each subsequent delay (default: 2) */
  backoffFactor?: number
  /** Optional callback invoked on each retry attempt */
  onRetry?: (attempt: number, delay: number, error: unknown) => void
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onRetry">> = {
  initialDelay: 1000,
  maxDelay: 30000,
  maxAttempts: 10,
  backoffFactor: 2,
}

/**
 * Calculates the delay for a given attempt using exponential backoff.
 * delay = min(initialDelay * backoffFactor^(attempt-1), maxDelay)
 */
export function calculateBackoffDelay(
  attempt: number,
  options: Pick<Required<RetryOptions>, "initialDelay" | "maxDelay" | "backoffFactor">
): number {
  const delay = options.initialDelay * Math.pow(options.backoffFactor, attempt - 1)
  return Math.min(delay, options.maxDelay)
}

/**
 * Retries an async function with exponential backoff.
 *
 * Starts at 1s delay, doubles each attempt, caps at 30s, max 10 attempts.
 * Throws the last error if all attempts are exhausted.
 *
 * @param fn - The async function to retry
 * @param options - Configuration for retry behavior
 * @returns The result of the successful function call
 * @throws The last error encountered after all attempts are exhausted
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const config = {
    initialDelay: options?.initialDelay ?? DEFAULT_OPTIONS.initialDelay,
    maxDelay: options?.maxDelay ?? DEFAULT_OPTIONS.maxDelay,
    maxAttempts: options?.maxAttempts ?? DEFAULT_OPTIONS.maxAttempts,
    backoffFactor: options?.backoffFactor ?? DEFAULT_OPTIONS.backoffFactor,
  }

  let lastError: unknown

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === config.maxAttempts) {
        break
      }

      const delay = calculateBackoffDelay(attempt, config)

      if (options?.onRetry) {
        options.onRetry(attempt, delay, error)
      }

      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Utility sleep function for delays between retries.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Checks if an error is a PocketBase connection error (network failure).
 */
export function isConnectionError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("enotfound") ||
      message.includes("timeout") ||
      message.includes("failed to fetch") ||
      message.includes("connection")
    )
  }
  return false
}
