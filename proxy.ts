import { NextResponse, type NextRequest } from "next/server"

// /tasks is a private area. Access requires the gate cookie, which is set by
// /api/tasks-auth after the correct passcode is entered at /tasks/gate.
// The cookie holds the SHA-256 of the passcode; we compare against the known
// hash (env override first, baked-in default second — the plaintext passcode
// never appears in code).
const COOKIE_NAME = "sidra_gate"
const DEFAULT_PASSCODE_SHA256 =
  "801a9340d50aba5b4ffae619bba5c60235b96806518b217eed6bf2385e6d1a11"

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // The gate itself and its auth endpoint stay reachable.
  if (pathname === "/tasks/gate" || pathname === "/api/tasks-auth") {
    return NextResponse.next()
  }

  const expected = process.env.TASKS_PASSCODE_SHA256 ?? DEFAULT_PASSCODE_SHA256
  const cookie = req.cookies.get(COOKIE_NAME)?.value

  if (cookie === expected) return NextResponse.next()

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const url = req.nextUrl.clone()
  url.pathname = "/tasks/gate"
  url.search = `?next=${encodeURIComponent(pathname + search)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/tasks/:path*", "/api/tasks-ai", "/api/tasks-transcribe"],
}
