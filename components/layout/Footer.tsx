import { profile } from "@/content/profile"

export default function Footer() {
  return (
    <footer>
      <div
        className="wrap"
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          © {new Date().getFullYear()} <b>{profile.name}</b> · tailornate.com
        </div>
        <nav aria-label="Footer navigation" style={{ display: "flex", gap: "20px" }}>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </nav>
        <div>Built with AutoMates. Powered by coffee.</div>
      </div>
    </footer>
  )
}
