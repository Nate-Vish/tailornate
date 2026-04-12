export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  status: "live" | "in-progress" | "planning"
  link?: string
  linkLabel?: string
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

export interface Profile {
  name: string
  title: string
  oneliner: string
  email: string
  linkedin: string
  github: string
  location: string
  languages: string[]
  about: string
}
