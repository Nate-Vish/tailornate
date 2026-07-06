import { experience } from "@/content/experience"

export default function Experience() {
  return (
    <section id="service" aria-labelledby="service-heading">
      <div className="wrap">
        <div className="sec-hd">
          <span className="sec-idx">05 / SERVICE</span>
          <h2 id="service-heading" className="sec-ti">
            Under <em>pressure</em>
          </h2>
          <p className="sec-lead">
            Intelligence work is data work — real-time, high-stakes, no second drafts.
          </p>
        </div>

        <div className="xp-list">
          {experience.map((xp) => (
            <article key={xp.role} className="xp">
              <div className="xp-period">{xp.period}</div>
              <div>
                <h3 className="xp-role">{xp.role}</h3>
                <div className="xp-org">{xp.org}</div>
                <ul className="xp-bullets">
                  {xp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
