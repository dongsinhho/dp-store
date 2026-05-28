import PocketBase from "pocketbase"
import { cookies } from "next/headers"

const PB_AUTH_COOKIE = "pb_auth"

/**
 * Create a server-side PocketBase instance authenticated from the cookie.
 * Returns the PocketBase instance and whether the user is an admin.
 */
export async function getAuthenticatedPb(): Promise<{
  pb: PocketBase
  isAdmin: boolean
  isAuthenticated: boolean
}> {
  const pb = new PocketBase(
    process.env.POCKETBASE_URL || "http://127.0.0.1:8090"
  )

  const cookieStore = cookies()
  const authCookie = cookieStore.get(PB_AUTH_COOKIE)

  if (!authCookie?.value) {
    return { pb, isAdmin: false, isAuthenticated: false }
  }

  try {
    const parsed = JSON.parse(authCookie.value)
    pb.authStore.save(parsed.token, parsed.model)

    // Verify the token is still valid
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh()
      const isAdmin = pb.authStore.model?.role === "admin"
      return { pb, isAdmin, isAuthenticated: true }
    }
  } catch {
    // Invalid cookie data or expired token
  }

  return { pb, isAdmin: false, isAuthenticated: false }
}

/**
 * Serialize PocketBase auth state to a cookie value.
 */
export function serializeAuthCookie(pb: PocketBase): string {
  return JSON.stringify({
    token: pb.authStore.token,
    model: pb.authStore.model,
  })
}

export { PB_AUTH_COOKIE }
