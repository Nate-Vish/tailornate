import FadeIn from "@/components/ui/FadeIn"

const items = [
  { icon: "→", text: "Active in Israel's GenAI developer community" },
  { icon: "→", text: "AWS meetups · Vega · RunAI CEO lecture · Malanta CEO lecture" },
  { icon: "→", text: "WhatsApp GenAI dev community groups" },
  { icon: "→", text: "Building in public on LinkedIn and GitHub" },
]

export default function Community() {
  return (
    <section
      id="community"
      aria-labelledby="community-heading"
      className="py-24 px-4 sm:px-6 section-divider"
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            Community
          </p>
          <h2 id="community-heading" className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-12">
            In the<br />
            <span className="text-gradient">ecosystem.</span>
          </h2>
        </FadeIn>

        <ul className="space-y-3">
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <li className="card-glow flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-4 text-sm text-[var(--muted-foreground)]">
                <span
                  className="text-[var(--accent)] font-bold shrink-0 text-base mt-0.5"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.text}
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  )
}
