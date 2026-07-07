import type { Project } from "@/types"

export const projects: Project[] = [
  {
    id: "automates",
    title: "AutoMates",
    tagline: "Open-source multi-agent AI development framework.",
    description:
      "12 AI agents coordinated through an Orca routing layer — with a LEARN FIRST knowledge protocol, cross-session memory, and five automated quality gates. Used daily to build every other project on this page.",
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
      "Dashboard that turns Excel financial data into narrative insights with the Gemini API — code computes the numbers, AI writes text only.",
    tech: ["Gemini API", "Next.js", "SheetJS", "Vercel", "AutoMates"],
    status: "shipped",
    path: "~/polaris",
    branch: "ibm-israel",
    glow: "#3d5a8b",
    glowBg: "rgba(61,90,139,0.15)",
    links: [{ label: "Handzone Leaders Program · IBM Israel" }],
    highlight: "MVP in one sprint · presented to IBM leadership",
  },
]

export const statusLabels: Record<Project["status"], string> = {
  live: "● live",
  shipped: "● shipped",
  "in-progress": "● in development",
  planning: "● planning",
}
