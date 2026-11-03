import { otherWork } from "@/content/portfolio"

export default function OtherWork() {
  return (
    <section id="work" className="pf-section" aria-labelledby="work-title">
      <div className="pf-wrap pf-split">
        <h2 id="work-title">Other work</h2>
        <ul className="pf-rows">
          {otherWork.map((w) => (
            <li key={w.title}>
              <h3>{w.title}</h3>
              <p>
                {w.line}
                {w.href && (
                  <>
                    {" "}
                    <a href={w.href} target="_blank" rel="noopener noreferrer" className="pf-link">
                      {w.linkLabel}
                    </a>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
