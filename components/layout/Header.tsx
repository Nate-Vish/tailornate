"use client"

import { useState, useEffect } from "react"

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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection("#" + entry.target.id)
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <a
          href="#hero"
          className="font-bold text-sm text-gradient hover:opacity-80 transition-opacity"
          aria-label="Back to top"
        >
          NH
        </a>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex gap-1">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              aria-current={activeSection === href ? "true" : undefined}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === href
                  ? "text-[var(--accent)] font-medium bg-[var(--accent)]/8"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            {menuOpen ? (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.293 3.293a1 1 0 011.414 0L9 7.586l4.293-4.293a1 1 0 111.414 1.414L10.414 9l4.293 4.293a1 1 0 01-1.414 1.414L9 10.414l-4.293 4.293a1 1 0 01-1.414-1.414L7.586 9 3.293 4.707a1 1 0 010-1.414z"
              />
            ) : (
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl px-4 pb-4 pt-2 flex flex-col gap-1"
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              aria-current={activeSection === href ? "true" : undefined}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                activeSection === href
                  ? "text-[var(--accent)] font-medium bg-[var(--card)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
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
