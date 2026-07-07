import { profile } from "@/content/profile"
import { Shelf, Guitar } from "@/components/decor/HomeOffice"

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="hero">
      <div className="wrap">
        <div className="hero-text">
          <div className="eyebrow in d1">
            {profile.name} <span style={{ margin: "0 10px" }}>—</span> AI Engineer
          </div>

          <h1 id="hero-title" className="in d2">
            Tailor
            <br />
            Nate<span className="amp">.</span>
          </h1>

          <p className="sub in d3">{profile.oneliner}</p>

          <p className="thesis in d4">{profile.thesis}</p>

          <div className="hero-meta in d4">
            <span>{profile.location}</span>
            <span className="dot" aria-hidden="true" />
            <span>CS @ HIT</span>
            <span className="dot" aria-hidden="true" />
            <span>Multi-agent systems</span>
          </div>

          <div className="ctas in d5">
            <a href="#work" className="btn btn-primary">
              See the work
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <a href="#chat" className="btn btn-ghost">
              Let&apos;s talk
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="contact-row in d6">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z" />
              </svg>
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.36 22.95c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11.01 11.01 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.79.11 3.08.74.81 1.19 1.83 1.19 3.09 0 4.43-2.68 5.41-5.24 5.69.42.36.79 1.06.79 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
              </svg>
            </a>
            <a href={`mailto:${profile.email}`} className="icon-link" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </a>
            <span className="avail">
              <span className="pulse" aria-hidden="true" />
              Open to work
            </span>
          </div>
        </div>

        <div className="hero-portrait in d3" aria-hidden="true">
          <Shelf />
          <div className="portrait-ring">
            <div className="portrait-inner">
              <svg viewBox="0 0 180 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="p-stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="8" height="8" fill="#2a2017" />
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#33281c" strokeWidth="3" />
                  </pattern>
                </defs>
                <rect width="180" height="180" fill="url(#p-stripe)" />
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  fill="#e8dfc8"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                  letterSpacing="1"
                >
                  PORTRAIT
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  fill="#9c9077"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="7"
                  letterSpacing="1"
                >
                  drop photo here
                </text>
              </svg>
            </div>
          </div>
          <div className="portrait-caption">
            <span className="pulse" />
            <span>Nathan · {new Date().getFullYear()}</span>
          </div>
          <Guitar />
        </div>
      </div>
    </section>
  )
}
