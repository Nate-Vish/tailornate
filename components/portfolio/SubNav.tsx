import type { ReactNode } from "react"

// Top bar for the pages under the portfolio (resume, case study). Same look as
// the portfolio nav, but its links leave the page instead of scrolling it.
const links = [
  { href: "/portfolio#bet-hadar", label: "Work" },
  { href: "/work/bet-hadar", label: "Case study" },
  { href: "/resume", label: "Resume" },
]

export default function SubNav({ current, children }: { current: string; children?: ReactNode }) {
  return (
    <header className="pf-nav pf-subnav">
      <div className="pf-wrap pf-nav-inner">
        <a href="/portfolio" className="pf-brand">
          Nathan Vishnevski
        </a>
        <nav aria-label="Main" className="pf-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} aria-current={l.href === current ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        {children}
      </div>
    </header>
  )
}
