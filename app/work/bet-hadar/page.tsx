import type { Metadata } from "next"
import CaseStudy from "./CaseStudy"
import "./case-study.css"

export const metadata: Metadata = {
  title: "Case Study: Procedures Portal for a Medical Center | Tailor Nate",
  description:
    "From on-site discovery to production on the client's own IIS server: how Nathan replaced a lock-prone Excel index with a Hebrew-first procedures portal for a rehabilitation medical center.",
}

export default function BetHadarCaseStudyPage() {
  return <CaseStudy />
}
