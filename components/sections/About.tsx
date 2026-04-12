import FadeIn from "@/components/ui/FadeIn"
import { profile } from "@/content/profile"

const stats = [
  { value: "4yr", label: "IDF Officer" },
  { value: "150", label: "Reserve Days" },
  { value: "12", label: "AI Agents" },
  { value: "3rd", label: "Hackathon" },
]

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-24 px-4 sm:px-6 section-divider"
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            About
          </p>
          <h2 id="about-heading" className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-12">
            A different kind of<br />
            <span className="text-gradient">CS student.</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-[1fr_200px] gap-12 items-start">
          {/* Narrative */}
          <FadeIn delay={0.1}>
            <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed text-[1.05rem]">
              {profile.about.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              <p className="mt-6 text-sm">
                <span className="text-[var(--foreground)] font-medium">Languages — </span>
                {profile.languages.join(" · ")}
              </p>
            </div>
          </FadeIn>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {stats.map(({ value, label }, i) => (
              <FadeIn key={label} delay={0.15 + i * 0.07}>
                <div className="card-glow rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-center">
                  <div
                    className="text-3xl font-bold text-gradient"
                    aria-label={`${value} ${label}`}
                  >
                    {value}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1 uppercase tracking-widest">
                    {label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
