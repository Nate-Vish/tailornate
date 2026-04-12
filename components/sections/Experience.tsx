import { experience } from "@/content/experience"

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-20 px-4 sm:px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <h2 id="experience-heading" className="text-2xl font-bold mb-10 text-[var(--foreground)]">
          Experience
        </h2>

        <ol className="relative border-l border-[var(--border)] ml-4 space-y-10">
          {experience.map((entry, i) => (
            <li key={i} className="ml-8">
              {/* Timeline dot */}
              <span
                aria-hidden="true"
                className="absolute -left-2 w-4 h-4 rounded-full bg-[var(--accent)] border-2 border-[var(--background)]"
              />

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--foreground)]">{entry.role}</h3>
                  <p className="text-sm text-[var(--muted)]">{entry.org}</p>
                </div>
                <time className="text-xs text-[var(--muted)] shrink-0">{entry.period}</time>
              </div>

              <ul className="space-y-1.5" aria-label={`Responsibilities at ${entry.org}`}>
                {entry.bullets.map((bullet, j) => (
                  <li key={j} className="flex gap-2 text-sm text-[var(--muted)]">
                    <span aria-hidden="true" className="text-[var(--accent)] shrink-0 mt-0.5">–</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
