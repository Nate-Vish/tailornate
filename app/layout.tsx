import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Nathan Hai Vishnevski — AI Engineer & Builder",
  description:
    "Portfolio of Nathan Hai Vishnevski. AI engineer, IDF intelligence officer, CS student at HIT. Builder of AutoMates — a 12-agent AI development framework.",
  openGraph: {
    title: "Nathan Hai Vishnevski",
    description: "AI Engineer | CS Student | Builder",
    url: "https://tailornate.com",
    siteName: "Nathan Hai Vishnevski",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("https://tailornate.com"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
