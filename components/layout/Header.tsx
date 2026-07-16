"use client"

import { useState, useEffect, useCallback, useSyncExternalStore } from "react"

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  })
  return () => observer.disconnect()
}

function getTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"
}

const navLinks = [
  { href: "#work", label: "work" },
  { href: "#stack", label: "stack" },
  { href: "#about", label: "about" },
  { href: "#service", label: "service" },
  { href: "#education", label: "education" },
  { href: "#room", label: "community" },
  { href: "#chat", label: "ask ai" },
  { href: "/resume", label: "resume" },
]

export default function Header() {
  const [activeSection, setActiveSection] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "dark" as const)

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light"
    document.documentElement.setAttribute("data-theme", next)
    try {
      localStorage.setItem("tn.theme", next)
    } catch {}
  }, [theme])

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
    <header className="nav">
      <div className="wrap nav-inner">
        <a href="#hero" className="brand" aria-label="Back to top">
          Tailor Nate<em>.</em>
        </a>

        <div className="nav-tools">
          <nav aria-label="Main navigation" className="nav-links">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="nav-link"
                aria-current={activeSection === href ? "true" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>

          <button
            className="chip"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
            <span>{theme === "light" ? "Light" : "Dark"}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="chip menu-btn"
            style={{ padding: "0 10px" }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
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
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile navigation" className="mobile-menu">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="nav-link"
              aria-current={activeSection === href ? "true" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
