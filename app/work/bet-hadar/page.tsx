import type { Metadata } from "next"
import SubNav from "@/components/portfolio/SubNav"
import { grotesk, heebo } from "../../portfolio/fonts"
import CaseStudy from "./CaseStudy"
import "../../portfolio/portfolio.css"
import "./case-study.css"

export const metadata: Metadata = {
  title: "Case study: a procedures portal for a medical center | Nathan Hai Vishnevski",
  description:
    "From on-site discovery to production on the client's own IIS server: how Nathan replaced a lock-prone Excel index with a Hebrew-first procedures portal for a rehabilitation medical center.",
}

export default function BetHadarCaseStudyPage() {
  return (
    <div className={`pf ${grotesk.variable} ${heebo.variable}`}>
      <SubNav current="/work/bet-hadar" />
      <CaseStudy />
    </div>
  )
}
