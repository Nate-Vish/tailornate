import type { Metadata } from "next"
import "./case-study.css"

export const metadata: Metadata = {
  title: "Case Study: Procedures Portal for a Medical Center | Tailor Nate",
  description:
    "From on-site discovery to production on the client's own IIS server: how Nathan replaced a lock-prone Excel index with a Hebrew-first procedures portal for a rehabilitation medical center.",
}

const TAGS = [
  "ASP.NET Core",
  "C#",
  "SQLite / EF Core",
  "IIS / Windows Server",
  "Active Directory",
  "Python",
  "Hebrew RTL",
  "On-Prem Deployment",
]

export default function BetHadarCaseStudy() {
  return (
    <div className="cs-page">
      <div className="cs-wrap">
        <a href="/" className="cs-back">
          back to tailornate.com
        </a>

        <div className="cs-eyebrow">Case Study · Bet Hadar Medical Center</div>
        <h1>Procedures Portal for a Rehabilitation Medical Center</h1>
        <p className="cs-sub">From discovery to production, end to end.</p>
        <span className="cs-status">● live in production, in daily use</span>

        <h2>The problem</h2>
        <p>
          The center managed its master index of clinical procedures in one shared Excel file
          that linked to hundreds of Word documents on a network share. Excel takes a whole-file
          lock, so the index broke whenever several staff opened it at once. There was no access
          control and no record of who read what, even though an annual sign-off on core
          procedures is a regulatory requirement.
        </p>

        <h2>My role</h2>
        <p>
          I came to the institution, sat with the staff and their IT, and characterized the real
          problem and the real requirements: concurrent reading, two access profiles, and a read
          log for the audit. Then I took the project end to end. Design, development, deployment
          on their internal network, and user training.
        </p>

        <h2>The solution</h2>
        <p>
          An internal ASP.NET Core (.NET 10) portal with SQLite, fully Hebrew (RTL), with zero
          internet dependencies. The legacy catalog migrated automatically: I wrote a Python
          extractor that read the hyperlinks inside the original Excel and preserved the folder
          structure, so about 90 document links worked immediately against the existing network
          share, without a single manual re-link. Each reader gets an independent copy of the
          procedure. Zero locks, the whole staff at once.
        </p>

        <h2>Key mechanisms</h2>
        <ul>
          <li>
            Full read tracking (name, national ID, department, timestamp) with a manager audit
            screen offering filtering and Excel export.
          </li>
          <li>Catalog and user management from the browser.</li>
          <li>
            Security and privacy hardening: login lockout, national-ID masking, CSV injection
            protection, and automatic data purge by retention policy.
          </li>
          <li>
            Update-safe architecture: data lives apart from code, schema managed with EF Core
            migrations. A future update never deletes what the institution has accumulated.
          </li>
        </ul>

        <h2>The deployment, which is the part that stands out</h2>
        <p>
          I installed the system myself on a Windows/IIS server inside the institution&apos;s
          internal network, and solved a chain of real enterprise infrastructure failures along
          the way: a mapped network drive that system services cannot see (diagnosed and moved to
          the UNC path), Active Directory permissions (the difference between a computer account
          and a domain identity for the application pool against the file share), and a firewall
          that blocked the port. By the end of the day the site was reachable from every employee
          workstation, files opened from the real network share, and the tracking recorded.
        </p>

        <h2>Handover and training</h2>
        <p>
          Full deliverables: an installation guide for IT, a presentation, an acceptance
          checklist, an interactive Hebrew training module with a quiz, and complete as-built
          documentation in a private repo.
        </p>

        <h2>Outcome</h2>
        <p>
          The system is live in production and used by the staff. The institution is evaluating
          follow-up expansions.
        </p>

        <div className="cs-tags">
          {TAGS.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <section className="cs-he" lang="he">
          <h2>הגרסה העברית</h2>

          <h2>הבעיה</h2>
          <p>
            מרכז רפואי שיקומי ניהל את מפתח הנהלים הרפואיים-סיעודיים שלו בקובץ אקסל משותף, שקישר
            למאות מסמכי Word על כונן רשת. הנעילה של אקסל שברה את הקובץ בכל פעם שכמה אנשי צוות
            פתחו אותו במקביל, לא הייתה שום בקרת גישה, ולא היה תיעוד של מי קרא מה, למרות שחתימה
            שנתית על נוהלי ליבה היא דרישה רגולטורית.
          </p>

          <h2>התפקיד שלי</h2>
          <p>
            הגעתי למוסד, ישבתי עם הצוות ועם ה-IT, אפיינתי את הבעיה האמיתית ואת הדרישות (קריאה
            מקבילית, שני פרופילי גישה, מעקב קריאה לביקורת), ולקחתי את הפרויקט מקצה לקצה: עיצוב,
            פיתוח, פריסה ברשת הפנימית שלהם, והדרכת המשתמשים.
          </p>

          <h2>הפתרון</h2>
          <p>
            פורטל פנימי ב-ASP.NET Core (.NET 10) עם SQLite, בעברית מלאה (RTL), ללא שום תלות
            באינטרנט. הקטלוג הקיים הוסב אוטומטית: כתבתי מחלץ Python שקרא את ההיפר-קישורים מתוך
            האקסל המקורי ושימר את מבנה התיקיות, כך שכ-90 קישורי מסמכים עבדו מיד מול כונן הרשת
            הקיים, בלי קישור ידני אחד. כל קורא מקבל עותק עצמאי של הנוהל. אפס נעילות, כל הצוות
            במקביל.
          </p>

          <h2>מנגנונים מרכזיים</h2>
          <ul>
            <li>מעקב קריאה מלא (שם, ת"ז, מחלקה, חותמת זמן) עם מסך ביקורת למנהלים הכולל סינון ויצוא לאקסל.</li>
            <li>ניהול קטלוג ומשתמשים מהדפדפן.</li>
            <li>הקשחת אבטחה ופרטיות: נעילת התחברות, מיסוך תעודות זהות, הגנת CSV, ומחיקת נתונים אוטומטית לפי מדיניות שמירה.</li>
            <li>ארכיטקטורה בטוחה-לעדכון: הנתונים מופרדים מהקוד, והסכמה מנוהלת ב-EF Core Migrations. עדכון עתידי לעולם לא מוחק את מה שהמוסד צבר.</li>
          </ul>

          <h2>הפריסה, החלק שמבדיל</h2>
          <p>
            התקנתי את המערכת בעצמי על שרת Windows/IIS ברשת הפנימית של המוסד, ופתרתי בדרך שרשרת
            תקלות תשתית ארגוניות אמיתיות: כונן רשת ממופה שאינו נראה לשירותי מערכת (אבחון והסבה
            לנתיב UNC), הרשאות Active Directory וההבדל בין חשבון מחשב לחשבון דומיין עבור זהות
            ה-Application Pool מול שיתוף הקבצים, וחומת אש שחסמה את הפורט. בסוף היום: האתר נגיש
            מכל עמדות העובדים, קבצים נפתחים מכונן הרשת האמיתי, והמעקב מתעד.
          </p>

          <h2>מסירה והדרכה</h2>
          <p>
            מדריך התקנה מלא ל-IT, מצגת, צ'קליסט קבלה (QA), לומדה אינטראקטיבית בעברית עם בוחן,
            ותיעוד "כמו-שהותקן" מלא ברפו פרטי.
          </p>

          <h2>תוצאה</h2>
          <p>המערכת חיה בפרודקשן ובשימוש הצוות. המוסד בוחן הרחבות המשך.</p>
        </section>
      </div>
    </div>
  )
}
