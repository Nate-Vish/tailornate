"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function GateForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!passcode.trim() || busy) return
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/tasks-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      })
      if (res.status === 204) {
        const next = params.get("next")
        router.replace(next && next.startsWith("/") ? next : "/tasks")
        return
      }
      setError(res.status === 429 ? "יותר מדי ניסיונות. נסה שוב עוד כמה דקות." : "קוד שגוי. נסה שוב.")
    } catch {
      setError("בעיית חיבור. נסה שוב.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-border bg-card p-6 text-center">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[22px]"
        style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}
      >
        🔒
      </div>
      <h1 className="mt-3 text-[18px] font-semibold text-foreground">אזור פרטי</h1>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        Sidra היא מערכת המשימות האישית של נתן.
        <br />
        יש לך קוד? יאללה.
      </p>
      <input
        type="password"
        inputMode="text"
        autoComplete="current-password"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="קוד גישה"
        className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-3 text-center text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-[var(--accent)]"
        autoFocus
      />
      {error && <p className="mt-2 text-[12px]" style={{ color: "var(--danger)" }}>{error}</p>}
      <button
        onClick={submit}
        disabled={!passcode.trim() || busy}
        className="mt-4 w-full rounded-lg py-3 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--accent)" }}
      >
        {busy ? "בודק…" : "כניסה"}
      </button>
      <a
        href="/portfolio"
        className="mt-4 inline-block text-[12px] text-muted-foreground hover:text-foreground"
      >
        ← חזרה לאתר
      </a>
    </div>
  )
}

export default function GatePage() {
  return (
    <div dir="rtl" className="sidra flex min-h-dvh items-center justify-center bg-[var(--background)] px-4">
      <Suspense>
        <GateForm />
      </Suspense>
    </div>
  )
}
