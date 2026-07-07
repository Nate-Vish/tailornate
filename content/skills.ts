import type { SkillCategory } from "@/types"

export const keySkills = [
  "Multi-Agent Orchestration",
  "Context Engineering",
  "LLMs",
  "RAG",
  "MCP",
  "Prompt Engineering",
  "Data-Driven Decisions",
  "Real-Time Intelligence",
  "Claude Code",
  "TypeScript",
]

export const skillCategories: SkillCategory[] = [
  {
    name: "AI & Agents",
    items: [
      "Multi-Agent Orchestration",
      "Context Engineering",
      "LLMs",
      "RAG",
      "MCP",
      "Prompt Engineering",
      "Agent Memory Systems",
      "Automated Quality Gates",
    ],
  },
  {
    name: "Data & Decisions",
    items: [
      "Data-Driven Decision Making",
      "Real-Time Intelligence",
      "Data Fusion & Verification",
      "pandas",
      "SheetJS",
      "Zod",
    ],
  },
  {
    name: "AI Tooling",
    items: ["Claude Code", "Gemini CLI", "Gemini API", "Vercel AI SDK", "n8n"],
  },
  {
    name: "Languages",
    items: ["TypeScript", "Python", "Java", "C / C++", "SQL"],
  },
  {
    name: "Web & Infrastructure",
    items: ["Next.js", "React", "Git", "GitHub", "Vercel", "shadcn/ui", "Linux"],
  },
]
