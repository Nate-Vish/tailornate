import { profile } from "@/content/profile"

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10 mt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <p className="font-bold text-gradient text-sm">Nathan Hai Vishnevski</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{profile.location} · Building in public</p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation" className="flex gap-5">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile (opens in new tab)"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              LinkedIn ↗
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile (opens in new tab)"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              GitHub ↗
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Email
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
