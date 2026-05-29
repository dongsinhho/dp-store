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

/**
 * Create a server-side PocketBase instance authenticated as superuser.
 * Use this for operations that require admin privileges (e.g., updating product stock).
 * Credentials are read from environment variables (never exposed to client).
 */
export async function createAdminPb(): Promise<PocketBase> {
  const pb = new PocketBase(
    process.env.POCKETBASE_URL || "http://127.0.0.1:8090"
  )

  const email = process.env.PB_ADMIN_EMAIL
  const password = process.env.PB_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error("PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables are required")
  }

  await pb.collection("_superusers").authWithPassword(email, password)

  return pb
}
