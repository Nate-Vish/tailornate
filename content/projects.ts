import type { Project } from "@/types"

export const projects: Project[] = [
  {
    id: "automates",
    title: "AutoMates",
    description:
      "Open-source multi-agent AI development framework. 12 specialized agents with persistent memory, slash-command orchestration, and a shared knowledge system. Agents research documentation before writing code. Used to build every other project on this list.",
    tech: ["Python", "Claude API", "MCP", "Claude Code"],
    status: "live",
    link: "https://github.com/Nate-Vish",
    linkLabel: "GitHub",
    highlight: "12 agents · 5-layer memory · dogfooded daily",
  },
  {
    id: "2fa-ai",
    title: "AI Intent Verification Layer",
    description:
      "Separate-device 2FA for enterprise AI agents. Adds human verification at the point of AI action — not just at login. Co-invented with Daniel Golzman. Addresses EU AI Act Article 14 compliance (enforcement Aug 2026). Warm lead with CrowdStrike.",
    tech: ["React", "TypeScript", "Vercel AI SDK"],
    status: "in-progress",
    highlight: "CrowdStrike lead · EU AI Act compliant · demo in progress",
  },
  {
    id: "madko",
    title: "Madko",
    description:
      "Adaptive knowledge brain for humans and AI agents. Architecture and tech stack complete. First vertical: DevOps knowledge. Domain purchased.",
    tech: ["SaaS", "Knowledge Graph", "AI"],
    status: "planning",
    link: "https://madko.ai",
    linkLabel: "madko.ai",
    highlight: "Domain live · architecture complete",
  },
  {
    id: "fincat",
    title: "FinCat",
    description:
      "AI expense categorizer for credit card statements. Processes unstructured financial text into structured categories using Claude API and prompt engineering.",
    tech: ["Python", "Claude API", "NLP"],
    status: "live",
    link: "https://github.com/Nate-Vish",
    linkLabel: "GitHub",
  },
]
