export interface ProjectLink {
  href?: string
  label: string
}

export interface Project {
  id: string
  title: string
  logo?: string
  tagline: string
  description: string
  tech: string[]
  status: "live" | "in-progress" | "planning" | "shipped"
  path: string
  branch: string
  glow: string
  glowBg: string
  links: ProjectLink[]
  highlight?: string
}

export interface ExperienceEntry {
  role: string
  org: string
  period: string
  bullets: string[]
}

export interface EducationEntry {
  degree: string
  institution: string
  period: string
  note?: string
}

export interface SkillCategory {
  name: string
  items: string[]
}

export interface Profile {
  name: string
  title: string
  oneliner: string
  thesis: string
  email: string
  linkedin: string
  github: string
  location: string
  languages: string[]
}
