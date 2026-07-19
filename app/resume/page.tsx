import type { Metadata } from "next"
import { profile } from "@/content/profile"
import PrintButton from "./PrintButton"
import "./resume.css"

export const metadata: Metadata = {
  title: "Resume - Nathan Hai Vishnevski",
  description:
    "Resume of Nathan Hai Vishnevski, AI engineer specializing in multi-agent systems. AutoMates, Polaris (IBM Israel), Bet Hadar, LOS, Madko.",
}

// One-page constraint: this page condenses the site content into resume
// density. Titles/dates/contacts come from content/*, the one-line proofs
// are maintained here.
const RESUME_SUMMARY =
  "AI engineer specializing in multi-agent systems, with a delivery record across real organizations: a finance tool presented to IBM Israel leadership, a procedures portal for a medical center, an agentic legal operating system built with a founding team. All of them shipped through AutoMates, my open-source multi-agent framework. Four years as an IDF officer embedded with 18 civilian communities, now a target intelligence officer in reserves. I walk into other people's worlds, learn them fast, and build what they need."

const RESUME_WORK = [
  {
    title: "AutoMates",
    status: "live · open source",
    line: "Multi-agent AI development framework: specialized agents, a structured pipeline (spec, plan, build, verify), automated quality gates. Continuously evolved as the field moves. The factory that ships every other project on this list, adopted by peers.",
  },
  {
    title: "Polaris - IBM Israel",
    status: "shipped",
    line: "Finance dashboard turning raw Excel into narrative insights (Gemini API). MVP in one sprint, presented to IBM Israel leadership. One design rule: code computes every figure, AI writes text only.",
  },
  {
    title: "Bet Hadar Portal - medical center client",
    status: "delivering",
    line: "Replaced a lock-prone shared Excel with an intranet portal: instant Hebrew search, a read-tracking audit trail with CSV export, manager roles. ASP.NET Core on the client's own IIS.",
  },
  {
    title: "LOS - Lawyers Operating System",
    status: "in development",
    line: "With a founding team: an agentic legal operating system for small Israeli law firms. A Hebrew-first team of seven AI agents does the routine work end-to-end, and the lawyer approves every output.",
  },
  {
    title: "Madko",
    status: "live",
    line: "Full-stack task-management product live at tailornate.com, with an AI assistant, voice capture, a calendar feed and gamified XP. My daily driver.",
  },
]

const RESUME_SERVICE = [
  {
    role: "Target Intelligence Officer, Reserves",
    org: "IDF",
    period: "2024 - Present",
    line: "Automation fusing multi-database operational data into decision-ready intelligence, with real-time calls in time-critical windows. 200 days deployed alongside a full CS course load.",
  },
  {
    role: "Territorial Defense Officer",
    org: "IDF",
    period: "2019 - 2023",
    line: "Embedded with 18 civilian communities, bridging their needs to army systems. Commanded 50 soldiers, with weekly briefings reaching 1,200+.",
  },
]

const RESUME_EDUCATION = [
  { line: "B.Sc. Computer Science - HIT, Holon Institute of Technology", period: "2024 - 2027 (exp.)" },
  { line: "AI Driven Development Program - Future HIT · accepted a year early", period: "2026" },
  { line: "Handzone Leaders Program - Future HIT · IBM Israel (where Polaris was built)", period: "2026" },
  { line: "Target Intelligence Professional - IDF certification · 3rd place, HIT GenAI Hackathon", period: "2024 · 2025" },
]

const RESUME_SKILLS = [
  { name: "AI & Agents", items: "Multi-agent orchestration, context engineering, LLMs, RAG, MCP, prompt engineering, evals & quality gates" },
  { name: "Code", items: "TypeScript, Python, Java, C/C++, SQL · Next.js, React, Node, ASP.NET Core" },
  { name: "Tooling & Infra", items: "Claude Code, Gemini API, Vercel AI SDK, n8n · Git, Vercel, IIS, Linux, Docker" },
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
          <p className="resume-role">AI Engineer · Multi-Agent Systems · CS @ HIT</p>
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
