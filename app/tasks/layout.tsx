import type { Metadata } from "next"
import { Rubik } from "next/font/google"
import "./sidra.css"

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sidra — משימות שמתקתקות | Tailornate",
  description:
    "Smart task manager with AI — prioritizes your day, balances your life, speaks Hebrew and English. Built by Nathan Hai Vishnevski.",
  robots: { index: false, follow: false },
}

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={rubik.variable} style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
      {children}
    </div>
  )
}
