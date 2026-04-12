"use client"

import { motion } from "framer-motion"
import { profile } from "@/content/profile"

const links = [
  { href: profile.linkedin, label: "LinkedIn", external: true },
  { href: profile.github, label: "GitHub", external: true },
  { href: `mailto:${profile.email}`, label: "Email", external: false },
]

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-name"
      className="relative pt-28 pb-24 px-4 sm:px-6 hero-bg overflow-hidden"
    >
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium tracking-widest uppercase text-[var(--accent)] mb-5"
        >
          AI Engineer · CS Student · Builder
        </motion.p>

        {/* Name */}
        <motion.h1
          id="hero-name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
        >
          <span className="text-gradient">Nathan</span>
          <br />
          <span className="text-[var(--foreground)]">Hai Vishnevski</span>
        </motion.h1>

        {/* One-liner */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl sm:text-2xl text-[var(--muted-foreground)] max-w-xl mb-10 leading-relaxed"
        >
          {profile.oneliner}
        </motion.p>

        {/* Links */}
        <motion.nav
          aria-label="Social links"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap gap-3"
        >
          {links.map(({ href, label, external }) => (
            <a
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer", "aria-label": `${label} (opens in new tab)` }
                : {})}
              className="group relative px-5 py-2.5 rounded-xl border border-[var(--border-hover)] text-sm font-medium text-[var(--foreground)] bg-[var(--card)] hover:border-[var(--accent)] hover:bg-[#0d1829] transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10">{label} ↗</span>
            </a>
          ))}
        </motion.nav>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 flex items-center gap-2 text-xs text-[var(--muted-foreground)] select-none"
          aria-hidden="true"
        >
          <div className="w-px h-10 bg-gradient-to-b from-[var(--accent)] to-transparent" />
          <span className="tracking-wider uppercase">scroll</span>
        </motion.div>
      </div>
    </section>
  )
}
