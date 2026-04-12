const items = [
  "Active in Israel's GenAI developer community",
  "AWS meetups · Vega · RunAI CEO lecture · Malanta CEO lecture",
  "WhatsApp GenAI dev community groups",
  "Building in public on LinkedIn and GitHub",
]

export default function Community() {
  return (
    <section id="community" aria-labelledby="community-heading" className="py-20 px-4 sm:px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <h2 id="community-heading" className="text-2xl font-bold mb-8 text-[var(--foreground)]">
          Community
        </h2>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-[var(--muted)]">
              <span aria-hidden="true" className="text-[var(--accent)] shrink-0 mt-0.5">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
