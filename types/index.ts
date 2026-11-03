export interface Profile {
  name: string
  title: string
  oneliner: string
  email: string
  linkedin: string
  github: string
  location: string
  languages: string[]
  portrait: string
}

export interface Fact {
  value: string
  label: string
}

export interface Milestone {
  when: string
  what: string
  detail?: string
  upcoming?: boolean
}

export interface WorkItem {
  title: string
  line: string
  href?: string
  linkLabel?: string
}
