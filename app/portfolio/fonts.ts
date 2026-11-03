import { Schibsted_Grotesk, Heebo } from "next/font/google"

// One Latin family for the whole page; Heebo only carries Hebrew script
// (the product illustration and the assistant).
export const grotesk = Schibsted_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: "variable",
})

export const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew"],
  weight: "variable",
})
