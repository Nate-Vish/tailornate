import type { Metadata, Viewport } from "next"
import { Rubik } from "next/font/google"
import "./sidra.css"

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Madko — מדקו למשימות | Tailornate",
  description:
    "Madko (מד קואורדינטות) — AI task navigator that points to your next move and keeps your life areas balanced. Hebrew-first. Built by Nathan Hai Vishnevski.",
  robots: { index: false, follow: false },
  manifest: "/tasks-manifest.webmanifest",
  icons: {
    apple: "/icons/madko-180.png",
  },
  appleWebApp: {
    capable: true,
    title: "Madko",
    statusBarStyle: "black-translucent",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8dfc8" },
    { media: "(prefers-color-scheme: dark)", color: "#14100c" },
  ],
}

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={rubik.variable} style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
      {children}
    </div>
  )
}
