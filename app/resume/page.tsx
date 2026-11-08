import type { Metadata } from "next"
import { profile } from "@/content/profile"
import { betHadar } from "@/content/portfolio"
import SubNav from "@/components/portfolio/SubNav"
import { grotesk, heebo } from "../portfolio/fonts"
import PrintButton from "./PrintButton"
import "../portfolio/portfolio.css"
import "./resume.css"

export const metadata: Metadata = {
  title: "Resume | Nathan Hai Vishnevski",
  description:
    "Resume of Nathan Hai Vishnevski, health tech entrepreneur in Israel. Software live at a medical center, built end to end with a team of AI agents.",
}

// The public resume. It condenses the portfolio into one printable page.
// Headings stay generic; the client is named once, in the line under the heading.
// The private CV is a separate document and is not this page.
const SUMMARY =
  "I build software for medical institutions, end to end. I start on the floor with the staff to find the real problem, write the spec, design the architecture, and build it with a team of AI agents I designed myself. Then I deploy it on the client's own servers and train the people who use it. Four years as an IDF officer working with 18 civilian communities taught me to learn other people's worlds fast."

const ROLES = [
  {
    when: "Jul 2026 to now",
    title: "Health Tech Entrepreneur",
    org: "Self-employed",
    live: true,
    projects: [
      {
        name: "A procedures system for a medical center",
        client: "Client: Bet Hadar, Ashdod. Geriatric and rehabilitation medical center, 11 departments, a staff of about 400.",
        points: [
          "Replaced a shared Excel index that locked whenever two people opened it with a Hebrew procedures system: instant search, read confirmations with Excel export, manager roles.",
          "On-site discovery, spec and architecture, build, deployment on the center's Windows Server and IIS, staff training. Over 100 procedures migrated automatically.",
          "Live since July 2026, two updates in the first five weeks, 455 read confirmations in the first 30 days.",
        ],
      },
      {
        name: "One portal for the whole center",
        status: "In development",
        points: [
          "Single sign-on, employee files and digital forms, permissions and audit, designed against the Ministry of Health cyber circular.",
        ],
      },
    ],
  },
  {
    when: "Oct 2026 to now",
    title: "Software engineer, R&D team",
    org: "Circlez.ai",
    line: "AI startup building B2B business matching. Real work items and pull requests reviewed by the R&D lead. My HIT degree project.",
  },
  {
    when: "2019 to 2023",
    title: "Officer",
    org: "Israel Defense Forces",
    line: "Worked with 18 civilian communities, bridging their needs to army systems and resources. Commanded 50 soldiers.",
  },
]

const PROJECTS = [
  {
    name: "AutoMates",
    tag: "Open source",
    line: "A multi-agent framework for Claude Code: spec, plan, build and verify agents with quality gates. The first public version of the method I build with every day.",
  },
  {
    name: "Polaris for IBM Israel",
    tag: "Handzone Leaders",
    line: "A finance tool that turns raw Excel into a written story. Code computes every number, AI only writes the text. Presented to IBM Israel leadership.",
  },
]

const SKILLS = [
  { group: "Product", items: ["On-site discovery", "Specification", "Requirements", "Staff training"] },
  { group: "Architecture", items: ["System design", "On-prem deployment", "Windows Server and IIS", "Active Directory", "SSO and audit"] },
  { group: "AI", items: ["Multi-agent orchestration", "Local LLMs", "RAG", "MCP", "Evals"] },
  { group: "Security", items: ["Security review", "Internal pentest", "MoH cyber circular"] },
  { group: "Stack", items: ["C#", "ASP.NET Core", "TypeScript", "Next.js", "Python", "SQL"] },
]

const EDUCATION = [
  { when: "2024 to 2027", what: "B.Sc. Computer Science", where: "HIT, Holon Institute of Technology" },
  { when: "2026", what: "AI Driven Development program", where: "Future HIT" },
  { when: "2026", what: "Handzone Leaders program", where: "Future HIT with IBM Israel" },
  { when: "2025", what: "Third place, GenAI Hackathon", where: "HIT" },
]

// The four numbers the portfolio leads with, minus the date (it is in the role line).
const FACTS = [
  { value: "~400", label: "Staff at the first client" },
  ...betHadar.facts.filter((f) => f.value !== "Jul 2026"),
]

export default function ResumePage() {
  return (
    <div className={`pf pf-resume ${grotesk.variable} ${heebo.variable}`}>
      <SubNav current="/resume">
        <PrintButton />
      </SubNav>

      <main className="rs-stage">
        <article className="rs-sheet">
          <header className="rs-head">
            <div>
              <h1>{profile.name}</h1>
              <p className="rs-role">Health Tech Entrepreneur</p>
              <p className="rs-tagline">Software for medical institutions, from the problem on the floor to production.</p>
            </div>
            <ul className="rs-contact">
              <li>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </li>
              <li>
                <a href="https://www.tailornate.com">tailornate.com</a>
              </li>
              <li>
                <a href={profile.linkedin}>linkedin.com/in/nathan-hai-vishnevski</a>
              </li>
              <li>
                <a href={profile.github}>github.com/Nate-Vish</a>
              </li>
              <li>{profile.location}</li>
            </ul>
          </header>

          <p className="rs-summary">{SUMMARY}</p>

          <dl className="rs-facts">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="rs-body">
            <div className="rs-main">
              <section aria-labelledby="rs-exp">
                <h2 id="rs-exp">Experience</h2>
                <ol className="rs-roles">
                  {ROLES.map((r) => (
                    <li key={r.title} className={r.live ? "is-live" : undefined}>
                      <span className="rs-when">{r.when}</span>
                      <h3>
                        {r.title}
                        <span>{r.org}</span>
                      </h3>
                      {r.line && <p>{r.line}</p>}
                      {r.projects?.map((p) => (
                        <div key={p.name} className="rs-project">
                          <h4>
                            {p.name}
                            {p.status && <em>{p.status}</em>}
                          </h4>
                          {p.client && <p className="rs-client">{p.client}</p>}
                          <ul>
                            {p.points.map((pt) => (
                              <li key={pt}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </li>
                  ))}
                </ol>
              </section>

              <section aria-labelledby="rs-proj">
                <h2 id="rs-proj">Projects</h2>
                <ul className="rs-rows">
                  {PROJECTS.map((p) => (
                    <li key={p.name}>
                      <h3>
                        {p.name}
                        <span>{p.tag}</span>
                      </h3>
                      <p>{p.line}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <aside className="rs-side">
              <section aria-labelledby="rs-skills">
                <h2 id="rs-skills">What I do</h2>
                {SKILLS.map((s) => (
                  <div key={s.group} className="rs-skill">
                    <h3>{s.group}</h3>
                    <ul className="rs-chips">
                      {s.items.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              <section aria-labelledby="rs-edu">
                <h2 id="rs-edu">Education</h2>
                <ul className="rs-edu">
                  {EDUCATION.map((e) => (
                    <li key={e.what}>
                      <span className="rs-when">{e.when}</span>
                      <b>{e.what}</b>
                      <span>{e.where}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="rs-lang">
                <h2 id="rs-lang">Languages</h2>
                <ul className="rs-langs">
                  {profile.languages.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </article>
      </main>
    </div>
  )
}
