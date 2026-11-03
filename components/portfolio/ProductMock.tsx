// A drawn illustration of the procedures system, not a screenshot: the real
// screens and data stay on the client's network.

const rows = [
  { title: "מניעת נפילות מטופלים", dept: "סיעוד", read: true },
  { title: "זיהוי מטופל לפני מתן תרופות", dept: "רוקחות", read: false },
  { title: "ניוד מטופל ממיטה לכיסא", dept: "פיזיותרפיה", read: true },
  { title: "רחצת מטופל במיטה", dept: "סיעוד", read: true },
]

const depts = [
  { name: "מחלקה א", width: 92 },
  { name: "מחלקה ב", width: 78 },
  { name: "שיקום", width: 85 },
  { name: "סיעודי מורכב", width: 64 },
]

export default function ProductMock() {
  return (
    <figure className="pm-figure">
      <div className="pm" dir="rtl" lang="he" aria-hidden="true">
        <div className="pm-bar">
          <span className="pm-logo">נהלים</span>
          <span className="pm-org">בית הדר</span>
          <span className="pm-user">אחראית משמרת</span>
        </div>
        <div className="pm-body">
          <div className="pm-main">
            <div className="pm-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span>מטופל</span>
              <span className="pm-caret" />
            </div>
            <ul className="pm-rows">
              {rows.map((r) => (
                <li key={r.title} className={r.read ? "" : "pm-unread"}>
                  <span className="pm-title">{r.title}</span>
                  <span className="pm-tag">{r.dept}</span>
                  <span className="pm-state">{r.read ? "נקרא" : "לקריאה"}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pm-side">
            <b>אישורי קריאה</b>
            {depts.map((d) => (
              <div key={d.name} className="pm-meter">
                <span>{d.name}</span>
                <span className="pm-track">
                  <span style={{ width: `${d.width}%` }} />
                </span>
              </div>
            ))}
            <span className="pm-export">ייצוא לאקסל</span>
          </div>
        </div>
      </div>
      <figcaption>Illustration of the procedures system. The real screens stay on the client&apos;s network.</figcaption>
    </figure>
  )
}
