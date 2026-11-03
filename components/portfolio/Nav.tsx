import AskButton from "./AskButton"

const links = [
  { href: "#bet-hadar", label: "Work" },
  { href: "#how-i-build", label: "How I build" },
  { href: "#about", label: "About" },
  { href: "/resume", label: "Resume" },
]

export default function Nav() {
  return (
    <header className="pf-nav">
      <div className="pf-wrap pf-nav-inner">
        <a href="#top" className="pf-brand">
          Nathan Vishnevski
        </a>
        <nav aria-label="Main" className="pf-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <AskButton className="pf-btn pf-btn-small">Ask my assistant</AskButton>
      </div>
    </header>
  )
}
