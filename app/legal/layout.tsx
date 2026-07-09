import type { Metadata } from "next"
import { Rubik } from "next/font/google"
import "../tasks/sidra.css"

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "משפטי | Madko — Tailornate",
  robots: { index: true, follow: true },
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      dir="rtl"
      className={`${rubik.variable} sidra min-h-dvh bg-[var(--background)]`}
      style={{ fontFamily: "var(--font-rubik), sans-serif" }}
    >
      <main className="mx-auto max-w-[640px] px-5 py-10">{children}</main>
    </div>
  )
}
