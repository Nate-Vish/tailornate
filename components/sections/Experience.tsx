import FadeIn from "@/components/ui/FadeIn"
import { experience } from "@/content/experience"

export default function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="py-24 px-4 sm:px-6 section-divider"
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            Experience
          </p>
          <h2 id="experience-heading" className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-12">
            Service under<br />
            <span className="text-gradient">real pressure.</span>
          </h2>
        </FadeIn>

        <ol className="relative space-y-8" aria-label="Work experience timeline">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--accent)] via-[var(--accent-2)] to-transparent opacity-30"
            aria-hidden="true"
          />

          {experience.map((entry, i) => (
            <FadeIn key={i} delay={i * 0.1} direction="left">
              <li className="relative pl-8">
                {/* Timeline dot */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--accent)] bg-[var(--background)]"
                />

                <div className="card-glow rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--foreground)]">
                        {entry.role}
                      </h3>
                      <p className="text-sm text-[var(--accent)] font-medium mt-0.5">
                        {entry.org}
                      </p>
                    </div>
                    <time className="text-xs text-[var(--muted-foreground)] shrink-0 font-mono">
                      {entry.period}
                    </time>
                  </div>

                  <ul className="space-y-2" aria-label={`Responsibilities at ${entry.org}`}>
                    {entry.bullets.map((bullet, j) => (
                      <li key={j} className="flex gap-3 text-sm text-[var(--muted-foreground)]">
                        <span className="text-[var(--accent)] shrink-0 mt-0.5 font-bold" aria-hidden="true">
                          –
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  )
}
