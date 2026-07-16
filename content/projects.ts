import type { Project } from "@/types"

export const projects: Project[] = [
  {
    id: "automates",
    title: "AutoMates",
    tagline: "Open-source multi-agent AI development framework.",
    description:
      "12 AI agents coordinated through an Orca routing layer — a LEARN FIRST knowledge protocol, cross-session memory, and five automated quality gates. Started as my own workflow problem; now it's the factory that ships every other project on this page.",
    tech: ["Claude Code", "TypeScript", "MCP", "Multi-Agent", "Context Engineering"],
    status: "live",
    path: "~/automates",
    branch: "main",
    glow: "#2d5a3d",
    glowBg: "rgba(45,90,61,0.15)",
    links: [
      { href: "https://automate-s.com/", label: "automate-s.com" },
      { href: "https://github.com/Nate-Vish/Auto-Mates", label: "github.com/Nate-Vish/Auto-Mates" },
    ],
    highlight: "12 agents · 5 quality gates · adopted by peers",
  },
  {
    id: "polaris",
    title: "Polaris",
    tagline: "Finance insight tool built for IBM Israel.",
    description:
      "A dashboard that reads raw Excel financials and writes the story behind the numbers. One rule I refused to break: code computes every figure, AI writes text only — nobody presents a hallucinated number to finance people.",
    tech: ["Gemini API", "Next.js", "SheetJS", "Vercel", "AutoMates"],
    status: "shipped",
    path: "~/polaris",
    branch: "ibm-israel",
    glow: "#3d5a8b",
    glowBg: "rgba(61,90,139,0.15)",
    links: [{ label: "Handzone Leaders Program · IBM Israel" }],
    highlight: "MVP in one sprint · presented to IBM Israel leadership",
  },
  {
    id: "bet-hadar",
    title: "Bet Hadar Portal",
    tagline: "Procedures portal for a medical center.",
    description:
      "Their procedures index lived in one shared Excel file that locked whenever two people opened it. I replaced it with an intranet portal — instant Hebrew search, a read-tracking audit trail with CSV export, manager roles — built to run on infrastructure they already own.",
    tech: ["ASP.NET Core", "C#", "Hebrew RTL", "IIS", "AutoMates"],
    status: "in-progress",
    path: "~/bet-hadar",
    branch: "delivery",
    glow: "#2f5f5a",
    glowBg: "rgba(47,95,90,0.15)",
    links: [{ label: "Bet Hadar Medical Center · client delivery" }],
    highlight: "real client · unlimited concurrent readers, zero file locks",
  },
  {
    id: "los",
    title: "LOS",
    tagline: "An operating system for Hebrew-speaking law offices.",
    description:
      "Building with a founding team: a multi-agent product where AI drafts and lawyers decide. Hard legal-safety rules — the AI never pretends to be the lawyer — and Hebrew RTL as a first-class citizen, not an afterthought.",
    tech: ["Next.js", "TypeScript", "Multi-Agent", "Hebrew RTL", "AutoMates"],
    status: "in-progress",
    path: "~/los",
    branch: "first_step",
    glow: "#6b4a2f",
    glowBg: "rgba(107,74,47,0.15)",
    links: [{ label: "Lawyers Operating System · with founders" }],
    highlight: "7-agent team designed from the founders' sketches",
  },
  {
    id: "madko",
    title: "Madko",
    tagline: "The task manager this site runs on.",
    description:
      "Local-first PWA with an AI layer — task analysis, voice capture, gamified XP — that runs my actual life. You're looking at it right now: tailornate.com is Madko's home. Next milestone: accounts, multi-device sync, web-push reminders.",
    tech: ["Next.js 16", "TypeScript", "Vercel AI SDK", "PWA", "Zustand"],
    status: "live",
    path: "~/madko",
    branch: "main",
    glow: "#8b6d3d",
    glowBg: "rgba(139,109,61,0.15)",
    links: [{ href: "https://www.tailornate.com", label: "tailornate.com · you are here" }],
    highlight: "daily driver · AI layer benchmarked 28/28",
  },
]

export const statusLabels: Record<Project["status"], string> = {
  live: "● live",
  shipped: "● shipped",
  "in-progress": "● in development",
  planning: "● planning",
}
