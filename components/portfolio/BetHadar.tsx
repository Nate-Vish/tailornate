import { betHadar } from "@/content/portfolio"
import ProductMock from "./ProductMock"

export default function BetHadar() {
  return (
    <section id="bet-hadar" className="pf-section pf-feature" aria-labelledby="bh-title">
      <div className="pf-wrap">
        <div className="pf-feature-grid">
          <div className="pf-feature-text">
            <h2 id="bh-title">{betHadar.name}</h2>
            <p className="pf-kind">{betHadar.kind}</p>
            {betHadar.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <a href={betHadar.caseStudy} className="pf-link">
              Read the full case study
            </a>
          </div>
          <ProductMock />
        </div>

        <dl className="pf-facts">
          {betHadar.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        <ol className="pf-track" aria-label="Bet Hadar timeline">
          {betHadar.milestones.map((m) => (
            <li key={m.when} className={m.upcoming ? "is-next" : m.when === "Now" ? "is-now" : ""}>
              <span className="pf-when">{m.when}</span>
              <b>{m.what}</b>
              {m.detail && <p>{m.detail}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
