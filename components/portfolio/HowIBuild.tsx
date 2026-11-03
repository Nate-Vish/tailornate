import { pipeline, localModels } from "@/content/portfolio"

export default function HowIBuild() {
  return (
    <section id="how-i-build" className="pf-section pf-dark" aria-labelledby="build-title">
      <div className="pf-wrap">
        <div className="pf-split">
          <h2 id="build-title">One engineer, a team of AI agents.</h2>
          <p className="pf-intro">
            A coordinator agent splits the work across agents that write the spec, plan, build,
            review security and test. I make the decisions and own every line that ships.
          </p>
        </div>

        <ol className="pf-pipe">
          {pipeline.map((p) => (
            <li key={p.step}>
              <b>{p.step}</b>
              <span>{p.detail}</span>
            </li>
          ))}
        </ol>

        <div className="pf-local">
          <div>
            <h3>Private models on my own machine</h3>
            <p>
              For work that can&apos;t leave the room, I run open models locally, up to 120
              billion parameters and including a Hebrew model. Nothing is sent to an outside
              API.
            </p>
          </div>
          <ul className="pf-chips" aria-label="Local models">
            {localModels.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
