import { Badge } from "@/components/ui/badge"
import FadeIn from "@/components/ui/FadeIn"
import { projects } from "@/content/projects"

const statusConfig: Record<string, { label: string; class: string }> = {
  live:          { label: "Live",        class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  "in-progress": { label: "In Progress", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  planning:      { label: "Planning",    class: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
}

export default function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="py-24 px-4 sm:px-6 section-divider"
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            Projects
          </p>
          <h2 id="projects-heading" className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-12">
            Things I&apos;ve<br />
            <span className="text-gradient">built and shipped.</span>
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((project, i) => {
            const status = statusConfig[project.status]
            return (
              <FadeIn key={project.id} delay={i * 0.08}>
                <article className="card-glow group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 flex flex-col gap-4 h-full overflow-hidden">
                  {/* Gradient accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                    aria-hidden="true"
                  />

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-[var(--foreground)] leading-snug">
                      {project.title}
                    </h3>
                    <span
                      className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${status.class}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed flex-1">
                    {project.description}
                  </p>

                  {project.highlight && (
                    <p className="text-xs text-[var(--accent)] font-medium tracking-wide">
                      {project.highlight}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-xs bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] font-normal"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} — ${project.linkLabel} (opens in new tab)`}
                      className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors w-fit"
                    >
                      {project.linkLabel} ↗
                    </a>
                  )}
                </article>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
