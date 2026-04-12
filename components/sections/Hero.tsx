import { profile } from "@/content/profile"

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-name" className="pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1
          id="hero-name"
          className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-3"
        >
          {profile.name}
        </h1>
        <p className="text-lg sm:text-xl text-[var(--muted)] mb-6">{profile.title}</p>
        <p className="text-xl sm:text-2xl font-medium text-[var(--foreground)] mb-10 max-w-2xl">
          {profile.oneliner}
        </p>
        <nav aria-label="Social links" className="flex flex-wrap gap-3">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile (opens in new tab)"
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card)] hover:border-[var(--accent)] transition-colors"
          >
            LinkedIn ↗
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile (opens in new tab)"
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card)] hover:border-[var(--accent)] transition-colors"
          >
            GitHub ↗
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card)] hover:border-[var(--accent)] transition-colors"
          >
            Email
          </a>
        </nav>
      </div>
    </section>
  )
}
