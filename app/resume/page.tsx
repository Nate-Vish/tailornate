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
    "Resume of Nathan Hai Vishnevski, health tech entrepreneur in Israel. Selected client work, leadership experience and education.",
}

// The public resume. It condenses the portfolio into one printable page.
// Headings stay generic; the client is named once, in the line under the heading.
// The private CV is a separate document and is not this page.
const SUMMARY =
  "I work with the people responsible for a service, from the manager who needs a clear picture to the person doing the work each day. Together we identify where time is lost, decide what needs to change, and build a system the team can rely on. I stay involved through rollout and improvements."

const ROLES = [
  {
    when: "Current",
    title: "Health Tech Entrepreneur",
    org: "Self-employed",
    live: true,
    projects: [
      {
        name: "A procedures system for a medical center",
        client: "Client: Bet Hadar, Ashdod. Geriatric and rehabilitation medical center, 11 departments, a staff of about 400.",
        points: [
          "Staff can find the current procedure and managers can see who has read it. The previous shared index regularly locked during use.",
          "Worked directly with staff, moved more than 100 procedures to the new system and introduced it on the center’s own servers.",
          "In daily use by the staff, updated in production without touching their data, 455 read confirmations in a single month.",
        ],
      },
      {
        name: "One portal for the whole center",
        status: "In development",
        points: [
          "Extending the work to employee records and digital forms so the center can manage them in one place.",
        ],
      },
    ],
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
    line: "Published the development method I use to plan, review and test work before handing it to a client.",
  },
  {
    name: "Polaris for IBM Israel",
    tag: "Handzone Leaders",
    line: "A finance tool that turns raw Excel into a written story. Code computes every number, AI only writes the text. Presented to IBM Israel leadership.",
  },
]


const EDUCATION = [
  { when: "2024 to 2027", what: "B.Sc. Computer Science", where: "HIT, Holon Institute of Technology" },
  { when: "2026", what: "AI Driven Development program", where: "Future HIT" },
  { when: "2026", what: "Handzone Leaders program", where: "Future HIT with IBM Israel" },
  { when: "2025", what: "Third place, GenAI Hackathon", where: "HIT" },
]

// Same four numbers the portfolio leads with.
const FACTS = betHadar.facts

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
              <p className="rs-tagline">Independent software development for organizations.</p>
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
