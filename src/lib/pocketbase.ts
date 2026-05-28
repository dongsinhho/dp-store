import PocketBase from "pocketbase"

// Client-side PocketBase instance (singleton for browser)
export const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
)

// Server-side instance (no auth state sharing between requests)
export function createServerPb() {
  return new PocketBase(
    process.env.POCKETBASE_URL || "http://127.0.0.1:8090"
  )
}
