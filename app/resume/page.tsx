import type { Metadata } from "next"
import { profile } from "@/content/profile"
import { projects, statusLabels } from "@/content/projects"
import { experience } from "@/content/experience"
import { education } from "@/content/education"
import { skillCategories } from "@/content/skills"
import PrintButton from "./PrintButton"
import "./resume.css"

export const metadata: Metadata = {
  title: "Resume — Nathan Hai Vishnevski",
  description:
    "Resume of Nathan Hai Vishnevski — AI engineer, multi-agent systems. AutoMates, Polaris (IBM Israel), Bet Hadar, LOS, Madko.",
}

const RESUME_SUMMARY =
  "AI engineer specializing in multi-agent systems, with a delivery record across real organizations: a finance insight tool presented to IBM Israel leadership, a procedures portal for a medical center, and a legal-industry product built with a founding team — all shipped through AutoMates, my open-source multi-agent framework. Four years as an IDF officer embedding with 18 civilian communities, now a target intelligence officer in reserves. I walk into other people's worlds, learn them fast, and build what they need."

export default function ResumePage() {
  return (
    <div className="resume-page">
      <a href="/" className="resume-back">
        ← back to tailornate.com
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
              <a href={profile.linkedin}>LinkedIn</a>
            </li>
            <li>
              <a href={profile.github}>GitHub</a>
            </li>
            <li>
              <a href="https://www.tailornate.com">tailornate.com</a>
            </li>
          </ul>
          <p className="resume-summary">{RESUME_SUMMARY}</p>
        </header>

        <section className="resume-sec">
          <h2>Selected Work</h2>
          {projects.map((p) => (
            <div key={p.id} className="resume-item">
              <div className="resume-item-hd">
                <h3>
                  {p.title} <span>— {p.tagline}</span>
                </h3>
                <span className="resume-period">{statusLabels[p.status]}</span>
              </div>
              <p className="resume-tagline">{p.description}</p>
              {p.highlight && <div className="resume-highlight">{p.highlight}</div>}
            </div>
          ))}
        </section>

        <section className="resume-sec">
          <h2>Service</h2>
          {experience.map((xp) => (
            <div key={xp.role} className="resume-item">
              <div className="resume-item-hd">
                <h3>
                  {xp.role} <span>— {xp.org}</span>
                </h3>
                <span className="resume-period">{xp.period}</span>
              </div>
              <ul>
                {xp.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="resume-sec">
          <h2>Education & Programs</h2>
          {education.map((e) => (
            <div key={e.degree} className="resume-item">
              <div className="resume-item-hd">
                <h3>
                  {e.degree} <span>— {e.institution}</span>
                </h3>
                <span className="resume-period">{e.period}</span>
              </div>
              {e.note && <p className="resume-tagline">{e.note}</p>}
            </div>
          ))}
        </section>

        <section className="resume-sec">
          <h2>Skills</h2>
          <ul className="resume-skills">
            {skillCategories.map((c) => (
              <li key={c.name}>
                <b>{c.name}:</b> {c.items.join(", ")}
              </li>
            ))}
          </ul>
          <p className="resume-langs">
            <b>Languages:</b> {profile.languages.join(" · ")}
          </p>
        </section>
      </article>
    </div>
  )
}
