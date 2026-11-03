import type { Metadata } from "next"
import { profile } from "@/content/profile"
import PrintButton from "./PrintButton"
import "./resume.css"

export const metadata: Metadata = {
  title: "Resume - Nathan Hai Vishnevski",
  description:
    "Resume of Nathan Hai Vishnevski, independent software engineer for healthcare. Bet Hadar, Circlez.ai, AutoMates, Polaris (IBM Israel).",
}

// One-page constraint: this page condenses the site content into resume
// density. Titles/dates/contacts come from content/*, the one-line proofs
// are maintained here.
const RESUME_SUMMARY =
  "Independent software engineer building for healthcare. My first system is live at a geriatric and rehabilitation medical center with a staff of about 400, deployed on their own servers. I take projects end to end: on-site discovery, design, build, deployment and staff training, with a team of AI agents I designed myself. Four years as an IDF officer working with 18 civilian communities taught me to learn other people's worlds fast and build what they actually need."

const RESUME_WORK = [
  {
    title: "Bet Hadar - geriatric and rehabilitation medical center, Ashdod",
    status: "live since Jul 2026",
    line: "Replaced a lock-prone shared Excel index with a Hebrew procedures system: instant search, read confirmations with Excel export, manager roles. ASP.NET Core on the center's own Windows Server and IIS, 100+ procedures migrated, staff trained, 455 read confirmations in the first 30 days. Now building one portal for the whole center: single sign-on, employee files, permissions and audit.",
  },
  {
    title: "Circlez.ai - software engineer, HIT degree project",
    status: "since Oct 2026",
    line: "Engineer in the R&D team of an AI startup building B2B business matching: real work items, pull requests reviewed by the R&D lead, daily status with the team.",
  },
  {
    title: "AutoMates",
    status: "open source",
    line: "Multi-agent development framework for Claude Code: specialized agents in a structured pipeline (spec, plan, build, verify) with quality gates. The open first version of the method I build everything with, now including security review, an internal pentest agent and local models.",
  },
  {
    title: "Polaris - HIT x IBM Israel",
    status: "demoed",
    line: "Finance dashboard turning raw Excel into narrative insights (Gemini API), built in the Handzone Leaders Program. MVP in one sprint, presented to IBM Israel leadership at demo day. One design rule: code computes every figure, AI writes text only.",
  },
]

const RESUME_SERVICE = [
  {
    role: "Officer",
    org: "IDF",
    period: "2019 - 2023",
    line: "Worked with 18 civilian communities, bridging their needs to army systems and resources. Commanded 50 soldiers, with weekly briefings reaching 1,200+.",
  },
]

const RESUME_EDUCATION = [
  { line: "B.Sc. Computer Science - HIT, Holon Institute of Technology", period: "2024 - 2027 (exp.)" },
  { line: "AI Driven Development Program - Future HIT · accepted a year early", period: "2026" },
  { line: "Handzone Leaders Program - Future HIT · IBM Israel (where Polaris was built)", period: "2026" },
  { line: "3rd place, HIT GenAI Hackathon", period: "2025" },
]

const RESUME_SKILLS = [
  { name: "AI & Agents", items: "Multi-agent orchestration, context engineering, LLMs, RAG, MCP, prompt engineering, evals & quality gates" },
  { name: "Code", items: "C#, ASP.NET Core, TypeScript, Python, Java, C/C++, SQL · Next.js, React" },
  { name: "Tooling & Infra", items: "Claude Code, Codex, local models (Ollama), Gemini API, Vercel AI SDK · IIS, Active Directory, Windows Server, Linux, Docker, Git" },
]

export default function ResumePage() {
  return (
    <div className="resume-page">
      <a href="/" className="resume-back">
        back to tailornate.com
      </a>
      <PrintButton />
      <article className="resume-sheet">
        <header className="resume-hd">
          <h1>{profile.name}</h1>
          <p className="resume-role">Software engineer for healthcare · AI agents · CS @ HIT</p>
          <ul className="resume-contact">
            <li>{profile.location}</li>
            <li>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <a href={profile.linkedin}>LinkedIn: nathan-hai-vishnevski</a>
            </li>
            <li>
              <a href={profile.github}>GitHub: Nate-Vish</a>
            </li>
            <li>
              <a href="https://www.tailornate.com">tailornate.com</a>
            </li>
          </ul>
          <p className="resume-summary">{RESUME_SUMMARY}</p>
        </header>

        <section className="resume-sec">
          <h2>Selected Work</h2>
          {RESUME_WORK.map((w) => (
            <div key={w.title} className="resume-item">
              <div className="resume-item-hd">
                <h3>{w.title}</h3>
                <span className="resume-period">{w.status}</span>
              </div>
              <p className="resume-line">{w.line}</p>
            </div>
          ))}
        </section>

        <section className="resume-sec">
          <h2>Service</h2>
          {RESUME_SERVICE.map((xp) => (
            <div key={xp.role} className="resume-item">
              <div className="resume-item-hd">
                <h3>
                  {xp.role} <span>- {xp.org}</span>
                </h3>
                <span className="resume-period">{xp.period}</span>
              </div>
              <p className="resume-line">{xp.line}</p>
            </div>
          ))}
        </section>

        <section className="resume-sec">
          <h2>Education & Programs</h2>
          {RESUME_EDUCATION.map((e) => (
            <div key={e.line} className="resume-item resume-item-tight">
              <div className="resume-item-hd">
                <h3 className="resume-edu">{e.line}</h3>
                <span className="resume-period">{e.period}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="resume-sec">
          <h2>Skills & Languages</h2>
          <ul className="resume-skills">
            {RESUME_SKILLS.map((c) => (
              <li key={c.name}>
                <b>{c.name}:</b> {c.items}
              </li>
            ))}
            <li>
              <b>Languages:</b> {profile.languages.join(" · ")}
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}
