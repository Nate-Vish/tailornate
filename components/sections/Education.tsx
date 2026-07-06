import { education } from "@/content/education"

export default function Education() {
  return (
    <section id="education" aria-labelledby="education-heading">
      <div className="wrap">
        <div className="sec-hd">
          <span className="sec-idx">06 / CREDENTIALS</span>
          <h2 id="education-heading" className="sec-ti">
            On <em>record</em>
          </h2>
        </div>

        <div className="edu-list">
          {education.map((e) => (
            <article key={e.degree} className="edu">
              <div>
                <h3 className="edu-degree">{e.degree}</h3>
                <div className="edu-inst">{e.institution}</div>
                {e.note && <div className="edu-note">{e.note}</div>}
              </div>
              <div className="edu-period">{e.period}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
