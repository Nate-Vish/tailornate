export default function Community() {
  return (
    <section id="room" aria-labelledby="room-heading">
      <div className="wrap">
        <div className="sec-hd">
          <span className="sec-idx">07 / NETWORK</span>
          <h2 id="room-heading" className="sec-ti">
            In the <em>room</em>
          </h2>
          <p className="sec-lead">Plugged into Israel&apos;s GenAI scene.</p>
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
            <p>LinkedIn posts and GitHub commits — shipped work with receipts.</p>
          </div>
          <div className="room">
            <h5>Peer reviews</h5>
            <p>Structured product reviews for peers — security, UX, market fit.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
