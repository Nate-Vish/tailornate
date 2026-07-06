import type { SkillCategory } from "@/types"

export const keySkills = [
  "TypeScript",
  "Python",
  "Multi-Agent Orchestration",
  "Claude Code",
  "Next.js",
  "RAG",
  "MCP",
  "n8n",
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
    ],
  },
  {
    name: "AI Tooling",
    items: ["Claude Code", "Gemini CLI", "Gemini API", "n8n"],
  },
  {
    name: "Languages",
    items: ["TypeScript", "Python", "Java", "C / C++", "SQL"],
  },
  {
    name: "Web & Infrastructure",
    items: ["Next.js", "React", "Git", "GitHub", "Vercel", "shadcn/ui", "Linux"],
  },
  {
    name: "Data",
    items: ["SheetJS", "pandas", "Zod"],
  },
]
