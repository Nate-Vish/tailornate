export default function Community() {
  return (
    <section id="room" aria-labelledby="room-heading">
      <div className="wrap">
        <div className="sec-hd">
          <span className="sec-idx">07 / NETWORK</span>
          <h2 id="room-heading" className="sec-ti">
            In the <em>room</em>
          </h2>
          <p className="sec-lead">
            Not a lurker — plugged into Israel&apos;s GenAI scene, learning and shipping in the
            same breath.
          </p>
        </div>

        <div className="room-grid">
          <div className="room">
            <h5>WhatsApp · daily signal</h5>
            <p>Active in the groups where new tools and patterns land first.</p>
            <div className="tags">
              <span>AIDD</span>
              <span>GenAI Israel</span>
              <span>Clawders</span>
              <span>AI Best Practices</span>
              <span>בונים AI</span>
            </div>
          </div>
          <div className="room">
            <h5>Events · in person</h5>
            <ul>
              <li>AWS meetups (×3)</li>
              <li>RunAI CEO lecture — speaker now VP at NVIDIA</li>
              <li>Vega</li>
              <li>Malanta CEO lecture</li>
            </ul>
          </div>
          <div className="room">
            <h5>Build in public</h5>
            <p>
              LinkedIn posts and GitHub commits document real projects. Not theory, not
              think-pieces — shipped work with receipts.
            </p>
          </div>
          <div className="room">
            <h5>Peer reviews</h5>
            <p>
              Delivered structured product reviews for peers using AutoMates — security, UX,
              market fit. Same rigour I use on my own.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
