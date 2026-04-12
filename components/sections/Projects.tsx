import { projects } from "@/content/projects"

const statusStyles: Record<string, string> = {
  live: "bg-emerald-900/40 text-emerald-400 border-emerald-800",
  "in-progress": "bg-amber-900/40 text-amber-400 border-amber-800",
  planning: "bg-slate-800 text-slate-400 border-slate-700",
}

const statusLabels: Record<string, string> = {
  live: "Live",
  "in-progress": "In Progress",
  planning: "Planning",
}

export default function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="py-20 px-4 sm:px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <h2 id="projects-heading" className="text-2xl font-bold mb-10 text-[var(--foreground)]">
          Projects
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <article
              key={project.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 flex flex-col gap-3 hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-[var(--foreground)]">{project.title}</h3>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded border ${statusStyles[project.status]}`}
                >
                  {statusLabels[project.status]}
                </span>
              </div>

              <p className="text-sm text-[var(--muted)] leading-relaxed">{project.description}</p>

              {project.highlight && (
                <p className="text-xs text-[var(--accent)] font-medium">{project.highlight}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} — ${project.linkLabel} (opens in new tab)`}
                  className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium mt-1 transition-colors w-fit"
                >
                  {project.linkLabel} ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
