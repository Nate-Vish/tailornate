import { profile } from "@/content/profile"
import AskButton from "./AskButton"

export default function Hero() {
  return (
    <section id="top" className="pf-hero" aria-labelledby="hero-title">
      <div className="pf-wrap pf-hero-grid">
        <div className="pf-hero-text">
          <p className="pf-live">
            <span className="pf-dot" aria-hidden="true" />
            Live at Bet Hadar medical center since July 2026
          </p>
          <h1 id="hero-title">{profile.oneliner}</h1>
          <p className="pf-lede">
            I&apos;m Nathan Hai Vishnevski, an independent software engineer in Israel. My
            first system runs at a geriatric rehabilitation center with a staff of about 400.
            I build with a team of AI agents I designed myself.
          </p>
          <div className="pf-actions">
            <AskButton />
            <a href="/work/bet-hadar" className="pf-btn">
              Read the case study
            </a>
          </div>
        </div>
        <figure className="pf-portrait">
          <img src={profile.portrait} alt="Nathan Hai Vishnevski" width={665} height={1000} />
        </figure>
      </div>
    </section>
  )
}
