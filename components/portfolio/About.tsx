import { background } from "@/content/portfolio"

export default function About() {
  return (
    <section id="about" className="pf-section pf-about" aria-labelledby="about-title">
      <div className="pf-wrap pf-split">
        <div>
          <h2 id="about-title">About</h2>
          <p className="pf-intro">
            Before code, I spent four years as an IDF officer working with 18 civilian
            communities, learning what each one needed and getting it delivered. I still work
            that way. Sit with the people, find the real problem, then build.
          </p>
        </div>
        <ol className="pf-timeline">
          {background.map((b) => (
            <li key={b.what}>
              <span className="pf-when">{b.when}</span>
              <b>{b.what}</b>
              {b.detail && <p>{b.detail}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
