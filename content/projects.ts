import type { Project } from "@/types"

export const projects: Project[] = [
  {
    id: "bet-hadar",
    title: "Bet Hadar Portal",
    tagline: "Procedures portal for a medical center, now growing into their management portal.",
    description:
      "Their procedures index lived in one shared Excel file that locked whenever two people opened it. I replaced it with an intranet portal, live in production since July 2026 and updated twice since: instant Hebrew search, a read-tracking audit trail with Excel export, manager roles. I deployed it myself on their Windows Server (IIS, Active Directory, firewall) and trained the staff with an interactive Hebrew training module. In September 2026 the engagement grew: I specified and demonstrated a portal that puts this system and two new ones, employee file and inventory, under one login with a management control panel. The build is the next delivery.",
    tech: ["ASP.NET Core", "C#", "Hebrew RTL", "IIS", "AutoMates"],
    status: "live",
    path: "~/bet-hadar",
    branch: "production",
    glow: "#2f5f5a",
    glowBg: "rgba(47,95,90,0.15)",
    links: [
      { href: "/work/bet-hadar", label: "full case study" },
    ],
    highlight: "live in production since July 2026 · deployed on-prem by me · growing into a portal",
  },
  {
    id: "circlez",
    title: "Circlez.ai",
    tagline: "Software engineer in a startup's R&D team, as my academic project at HIT.",
    description:
      "Circlez.ai, a Rishon LeZion startup, builds Smart Match AI: a business-matching platform for B2B companies in local markets. I joined its engineering team in October 2026 as my academic project at HIT. Real work items in the company's developer platform, pull requests reviewed by the R&D lead, daily status with the team.",
    tech: ["PowerShell", "GitHub", "Developer Tooling"],
    status: "in-progress",
    path: "~/circlez",
    branch: "dev",
    glow: "#5a3f8b",
    glowBg: "rgba(90,63,139,0.15)",
    links: [
      { href: "https://www.linkedin.com/company/circlez-ai", label: "Circlez.ai on LinkedIn" },
    ],
    highlight: "started October 2026 · my academic project from HIT · engineer in the R&D team",
  },
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
]

export const statusLabels: Record<Project["status"], string> = {
  live: "● live",
  shipped: "● shipped",
  "in-progress": "● in development",
  planning: "● planning",
}
