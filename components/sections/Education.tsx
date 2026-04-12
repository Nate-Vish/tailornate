import FadeIn from "@/components/ui/FadeIn"
import { education } from "@/content/education"

export default function Education() {
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="py-24 px-4 sm:px-6 section-divider"
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            Education
          </p>
          <h2 id="education-heading" className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-12">
            Credentials &<br />
            <span className="text-gradient">achievements.</span>
          </h2>
        </FadeIn>

        <ul className="space-y-3">
          {education.map((entry, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <li className="card-glow rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-[var(--foreground)]">{entry.degree}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{entry.institution}</p>
                  {entry.note && (
                    <p className="text-xs text-[var(--accent)] mt-1">{entry.note}</p>
                  )}
                </div>
                <time className="text-xs text-[var(--muted-foreground)] font-mono shrink-0">
                  {entry.period}
                </time>
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  )
}
