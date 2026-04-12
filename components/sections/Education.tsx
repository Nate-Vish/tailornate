import { education } from "@/content/education"

export default function Education() {
  return (
    <section id="education" aria-labelledby="education-heading" className="py-20 px-4 sm:px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <h2 id="education-heading" className="text-2xl font-bold mb-10 text-[var(--foreground)]">
          Education
        </h2>

        <ul className="space-y-4">
          {education.map((entry, i) => (
            <li
              key={i}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-sm text-[var(--foreground)]">{entry.degree}</p>
                <p className="text-sm text-[var(--muted)]">{entry.institution}</p>
                {entry.note && (
                  <p className="text-xs text-[var(--accent)] mt-0.5">{entry.note}</p>
                )}
              </div>
              <time className="text-xs text-[var(--muted)] shrink-0">{entry.period}</time>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
