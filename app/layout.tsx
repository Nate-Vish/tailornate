import type { Metadata } from "next"
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  weight: "variable",
})

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Tailor Nate | Nathan Hai Vishnevski · AI Engineer",
  description:
    "Nathan Hai Vishnevski, an AI engineer shipping multi-agent systems into the real world: IBM Israel, a medical center, law offices. Creator of AutoMates, an open-source multi-agent AI framework. IDF target intelligence officer, CS student at HIT.",
  openGraph: {
    title: "Tailor Nate | Nathan Hai Vishnevski",
    description: "I deliver AI systems that ship.",
    url: "https://tailornate.com",
    siteName: "Tailor Nate",
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("https://tailornate.com"),
}

const themeInit = `(function(){try{var t=localStorage.getItem('tn.theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  )
}
