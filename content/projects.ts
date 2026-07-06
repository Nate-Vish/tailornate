import type { Project } from "@/types"

export const projects: Project[] = [
  {
    id: "automates",
    title: "AutoMates",
    tagline: "Open-source multi-agent AI development framework.",
    description:
      "12 AI agents with distinct identities and domain knowledge, coordinated through an Orca routing layer that dispatches tasks and forges new agents on demand. LEARN FIRST protocol loads agents with curated knowledge before generating code. Five automated quality gates (security, legal, UX, brand, release) and cross-session memory. Used daily to build every other project on this page — currently powering an AI solution for the legal industry.",
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
      "AI-powered dashboard that analyzes Excel financial data and uses the Gemini API to generate narrative insights. Code computes the numbers; AI writes text only. Architected with Claude Code, Claude Design, and AutoMates as part of the Handzone Leaders Program. Delivered a working MVP within the sprint deadline and presented it to IBM Israel leadership.",
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
