import { profile } from "@/content/profile"

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>
          {profile.name} &mdash; {profile.location}
        </p>
        <nav aria-label="Footer navigation" className="flex gap-5">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile (opens in new tab)"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile (opens in new tab)"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            GitHub
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Email
          </a>
        </nav>
      </div>
    </footer>
  )
}
