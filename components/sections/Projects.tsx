import { projects, statusLabels } from "@/content/projects"

export default function Projects() {
  return (
    <section id="work" aria-labelledby="work-heading">
      <div className="wrap">
        <div className="sec-hd">
          <span className="sec-idx">02 / EVIDENCE</span>
          <h2 id="work-heading" className="sec-ti">
            The <em>Work</em>
          </h2>
          <p className="sec-lead">Used daily. Not demo-ware.</p>
        </div>

        <div className="projects">
          {projects.map((p) => (
            <article
              key={p.id}
              className="tcard"
              data-project={p.id}
              style={{ "--glow": p.glow, "--glow-bg": p.glowBg } as React.CSSProperties}
            >
              <div className="card-inner">
                <div>
                  <div className="card-top">
                    <div className="trafik" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="path">
                      <b>{p.path}</b> · <span className="line-muted">{p.branch}</span>
                    </span>
                    <span className="status">{statusLabels[p.status]}</span>
                  </div>
                  <h3 className="card-title">{p.title}</h3>
                  <div className="card-tag">{p.tagline}</div>
                  <p className="card-desc">{p.description}</p>
                  {p.highlight && (
                    <>
                      <div style={{ height: "18px" }} />
                      <div className="highlight">{p.highlight}</div>
                    </>
                  )}
                </div>
                <div className="card-right">
                  <div>
                    <div className="card-top" style={{ marginBottom: "12px" }}>
                      <span style={{ color: "var(--terminal-dim)" }}>stack</span>
                    </div>
                    <div className="stack">
                      {p.tech.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="card-links">
                    {p.links.map((l) =>
                      l.href ? (
                        <a
                          key={l.label}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link"
                        >
                          <span>{l.label}</span>
                          <span className="arr" aria-hidden="true">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <span key={l.label} className="link" style={{ cursor: "default" }}>
                          <span>{l.label}</span>
                          <span className="arr" aria-hidden="true">
                            ·
                          </span>
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
