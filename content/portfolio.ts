import type { Fact, Milestone, WorkItem } from "@/types"

// Every number here is backed by a record (deployment log, read log, staff
// count). "About 400" is the center's staff, not measured active users.

export const betHadar = {
  name: "Bet Hadar, Ashdod",
  kind: "Geriatric and rehabilitation medical center. 11 departments, a staff of about 400.",
  story: [
    "Their clinical procedures lived in one shared Excel file that locked whenever two people opened it. No access control, no record of who read what.",
    "I replaced it with a Hebrew procedures system that runs on their own servers. Nurses and caregivers find any procedure in seconds, and managers see exactly who read it.",
  ],
  facts: [
    { value: "Jul 2026", label: "Live in production" },
    { value: "455", label: "Read confirmations in the first 30 days" },
    { value: "100+", label: "Procedures migrated from the old index" },
    { value: "0", label: "Bytes in the cloud. It runs on their network." },
  ] satisfies Fact[],
  milestones: [
    { when: "Jul 2026", what: "Procedures system goes live", detail: "On-site discovery, build, deployment on their Windows Server, staff training." },
    { when: "Aug 2026", what: "Two updates in five weeks", detail: "Versions 1.1 and 1.2, shipped while the staff kept working." },
    { when: "Now", what: "One portal for the whole center", detail: "Single sign-on, employee files and digital forms, permissions and audit. Designed against the Ministry of Health cyber circular." },
    { when: "Next", what: "More rehabilitation and geriatric centers", detail: "The same system, adapted to each institution.", upcoming: true },
  ] satisfies Milestone[],
  caseStudy: "/work/bet-hadar",
}

export const pipeline = [
  { step: "Spec", detail: "What the people on the floor actually need" },
  { step: "Plan", detail: "Architecture before any code" },
  { step: "Build", detail: "Parallel agents, one coordinator" },
  { step: "Verify", detail: "Tests, security review, an internal pentest" },
  { step: "Ship", detail: "Deployed, trained, supported" },
]

export const localModels = ["gpt-oss 120B", "Qwen 27B", "Gemma 31B", "DictaLM 3.0 (Hebrew)"]

export const otherWork: WorkItem[] = [
  {
    title: "Circlez.ai",
    line: "Software engineer in the R&D team of an AI startup building B2B matching. My degree project, since October 2026.",
  },
  {
    title: "Polaris for IBM Israel",
    line: "A finance tool that turns raw Excel into a written story. Code computes every number, AI only writes the text. Presented to IBM Israel leadership.",
  },
  {
    title: "AutoMates",
    line: "Open source multi-agent framework for Claude Code. The first public version of the method I build with every day.",
    href: "https://github.com/Nate-Vish/Auto-Mates",
    linkLabel: "View on GitHub",
  },
  {
    title: "HIT GenAI Hackathon",
    line: "Third place, November 2025.",
  },
]

export const background: Milestone[] = [
  { when: "2019 to 2023", what: "IDF officer", detail: "Worked with 18 civilian communities. Commanded 50 soldiers." },
  { when: "2024", what: "B.Sc. Computer Science, HIT", detail: "Graduating 2027." },
  { when: "2026", what: "Handzone Leaders, HIT and IBM Israel", detail: "Plus the AI Driven Development program at Future HIT." },
  { when: "Oct 2026", what: "Independent, as Tailor Nate", detail: "Working with healthcare institutions and startups." },
]
