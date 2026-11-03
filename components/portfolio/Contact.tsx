import { profile } from "@/content/profile"
import AskButton from "./AskButton"

export default function Contact() {
  return (
    <section id="contact" className="pf-contact" aria-labelledby="contact-title">
      <div className="pf-wrap">
        <h2 id="contact-title">Let&apos;s build the next one.</h2>
        <p>
          I&apos;m looking for the next medical institutions to work with, from rehabilitation
          centers to hospitals. I&apos;m
          also open to good problems in other fields, and to partnerships with people building in
          health tech.
        </p>
        <div className="pf-actions">
          <AskButton />
          <a href={`mailto:${profile.email}`} className="pf-btn">
            {profile.email}
          </a>
        </div>
        <div className="pf-foot">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <nav aria-label="Elsewhere">
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="/resume">Resume</a>
          </nav>
        </div>
      </div>
    </section>
  )
}
