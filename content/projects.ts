import type { Project } from "@/types"

export const projects: Project[] = [
  {
    id: "automates",
    title: "AutoMates",
    logo: "/logos/automates.svg",
    tagline: "My multi-agent AI development method.",
    description:
      "Specialized AI agents in a structured pipeline (spec, plan, build, verify), with knowledge-first protocols, cross-session memory, and automated quality gates. Started as my own workflow problem and keeps evolving as the field moves: v1 went open source, v2 became my private working method. It's the factory that ships every other project on this page.",
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
    highlight: "used daily · v1 open source · v2 is my private working method",
  },
  {
    id: "polaris",
    title: "Polaris",
    logo: "/logos/polaris.png",
    tagline: "Finance insight tool, demoed to IBM Israel leadership.",
    description:
      "A dashboard that reads raw Excel financials and writes the story behind the numbers. One rule I refused to break: code computes every figure, AI writes text only. Nobody presents a hallucinated number to finance people.",
    tech: ["Gemini API", "Next.js", "SheetJS", "Vercel", "AutoMates"],
    status: "shipped",
    path: "~/polaris",
    branch: "ibm-israel",
    glow: "#3d5a8b",
    glowBg: "rgba(61,90,139,0.15)",
    links: [],
    highlight: "MVP in one sprint · presented to IBM Israel leadership at demo day",
  },
  {
    id: "bet-hadar",
    title: "Bet Hadar Portal",
    tagline: "Procedures portal for a medical center.",
    description:
      "Their procedures index lived in one shared Excel file that locked whenever two people opened it. I replaced it with an intranet portal, now live in production: instant Hebrew search, a read-tracking audit trail with Excel export, manager roles. I deployed it myself on their Windows Server (IIS, Active Directory, firewall) and trained the staff with an interactive Hebrew training module.",
    tech: ["ASP.NET Core", "C#", "Hebrew RTL", "IIS", "AutoMates"],
    status: "shipped",
    path: "~/bet-hadar",
    branch: "production",
    glow: "#2f5f5a",
    glowBg: "rgba(47,95,90,0.15)",
    links: [
      { href: "/work/bet-hadar", label: "full case study" },
    ],
    highlight: "live in production · deployed on-prem by me · staff trained",
  },
  {
    id: "los",
    title: "LOS",
    tagline: "Agentic legal operating system for lawyers.",
    description:
      "Building with a founding team: a Hebrew-first team of seven AI agents that does a small law firm's routine work end-to-end: drafting, research, review, office ops. AI drafts, the lawyer decides. Hard legal-safety rules mean the AI never pretends to be the lawyer.",
    tech: ["Next.js", "TypeScript", "Multi-Agent", "Hebrew RTL", "AutoMates"],
    status: "in-progress",
    path: "~/los",
    branch: "first_step",
    glow: "#6b4a2f",
    glowBg: "rgba(107,74,47,0.15)",
    links: [],
    highlight: "in development with a founding team · 7 AI agents",
  },
  {
    id: "madko",
    title: "Madko",
    logo: "/logos/madko.png",
    tagline: "The task manager this site runs on.",
    description:
      "A full-stack task-management product that runs my actual life, with an AI layer for task analysis, voice capture, a calendar feed and gamified XP. You're looking at it right now: tailornate.com is Madko's home. Next milestone: accounts, multi-device sync, web-push reminders.",
    tech: ["Next.js 16", "TypeScript", "Vercel AI SDK", "PWA", "Zustand"],
    status: "live",
    path: "~/madko",
    branch: "main",
    glow: "#8b6d3d",
    glowBg: "rgba(139,109,61,0.15)",
    links: [{ href: "https://www.tailornate.com", label: "tailornate.com · you are here" }],
    highlight: "live at tailornate.com · runs my day, every day",
  },
]

export const statusLabels: Record<Project["status"], string> = {
  live: "● live",
  shipped: "● shipped",
  "in-progress": "● in development",
  planning: "● planning",
}
