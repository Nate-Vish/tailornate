import { aboutParagraphs, principles, profile } from "@/content/profile"

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading">
      <div className="wrap">
        <div className="sec-hd">
          <span className="sec-idx">04 / OPERATING SYSTEM</span>
          <h2 id="about-heading" className="sec-ti">
            How I <em>work</em>
          </h2>
        </div>

        <div className="about-grid">
          <div className="about-body">
            {aboutParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p style={{ fontSize: "17px", color: "var(--mut)", fontStyle: "italic" }}>
              {profile.languages.join(" · ")}
            </p>
          </div>
          <div className="method">
            <h5>Operating principles</h5>
            <ol>
              {principles.map((pr) => (
                <li key={pr.title}>
                  <b>{pr.title}</b>
                  <span>{pr.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
