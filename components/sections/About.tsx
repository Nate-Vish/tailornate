import { profile } from "@/content/profile"

const stats = [
  { value: "4yr", label: "IDF Officer" },
  { value: "150", label: "Reserve Days" },
  { value: "12", label: "AI Agents Built" },
  { value: "3rd", label: "GenAI Hackathon" },
]

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-20 px-4 sm:px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <h2 id="about-heading" className="text-2xl font-bold mb-10 text-[var(--foreground)]">
          About
        </h2>

        <div className="grid md:grid-cols-[1fr_220px] gap-12">
          {/* Narrative */}
          <div className="space-y-4 text-[var(--muted)] leading-relaxed">
            {profile.about.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <p className="text-[var(--muted)]">
              <strong className="text-[var(--foreground)]">Languages:</strong>{" "}
              {profile.languages.join(" · ")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center"
              >
                <div className="text-3xl font-bold text-[var(--accent)]">{value}</div>
                <div className="text-xs text-[var(--muted)] mt-1 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
