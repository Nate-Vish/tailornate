"use client"

import { useState, useEffect } from "react"
import { profile } from "@/content/profile"

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#community", label: "Community" },
  { href: "#chat", label: "Ask AI" },
]

export default function Header() {
  const [activeSection, setActiveSection] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection("#" + entry.target.id)
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )

    const sections = document.querySelectorAll("section[id]")
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Name/logo */}
        <a
          href="#hero"
          className="font-semibold text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
        >
          {profile.name.split(" ")[0]} Hai
        </a>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex gap-1">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              aria-current={activeSection === href ? "true" : undefined}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                activeSection === href
                  ? "text-[var(--accent)] font-medium"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            {menuOpen ? (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            ) : (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[var(--border)] px-4 pb-4 pt-2 flex flex-col gap-1"
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              aria-current={activeSection === href ? "true" : undefined}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                activeSection === href
                  ? "text-[var(--accent)] font-medium bg-[var(--card)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
