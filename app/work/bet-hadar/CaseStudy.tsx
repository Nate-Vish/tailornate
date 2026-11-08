"use client"

import { useState } from "react"

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

function EnglishContent() {
  return (
    <>
      <p className="cs-eyebrow">Case study</p>
      <h1>A procedures portal for a rehabilitation medical center</h1>
      <p className="cs-sub">From discovery to production, end to end.</p>
      <p className="cs-client">
        Client: Bet Hadar, Ashdod. Geriatric and rehabilitation medical center, 11 departments, a
        staff of about 400.
      </p>
      <p className="pf-live cs-status">
        <span className="pf-dot" aria-hidden="true" />
        Live in production, in daily use
      </p>

      <h2>The problem</h2>
      <p>
        The center managed its master index of clinical procedures in one shared Excel file that
        linked to hundreds of Word documents on a network share. Excel takes a whole-file lock, so
        the index broke whenever several staff opened it at once. There was no access control and
        no record of who read what, even though an annual sign-off on core procedures is a
        regulatory requirement.
      </p>

      <h2>My role</h2>
      <p>
        I came to the institution, sat with the staff and their IT, and characterized the real
        problem and the real requirements: concurrent reading, two access profiles, and a read log
        for the audit. Then I took the project end to end. Design, development, deployment on their
        internal network, and user training.
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
        internal network, and solved a chain of real enterprise infrastructure failures along the
        way: a mapped network drive that system services cannot see (diagnosed and moved to the UNC
        path), Active Directory permissions (the difference between a computer account and a domain
        identity for the application pool against the file share), and a firewall that blocked the
        port. By the end of the day the site was reachable from every employee workstation, files
        opened from the real network share, and the tracking recorded.
      </p>

      <h2>Handover and training</h2>
      <p>
        Full deliverables: an installation guide for IT, a presentation, an acceptance checklist,
        an interactive Hebrew training module with a quiz, and complete as-built documentation in a
        private repo.
      </p>

      <h2>Outcome</h2>
      <p>
        The system is live in production and in daily use, and has been updated in place with
        the client&apos;s data untouched by every update. The institution came back for more: a portal that
        puts this system and two new ones under one login, with the build as the next delivery.
      </p>

      <div className="cs-tags">
        {TAGS.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </>
  )
}

function HebrewContent() {
  return (
    <div className="cs-he" lang="he" dir="rtl">
      <p className="cs-eyebrow">קייס סטאדי</p>
      <h1>פורטל נהלים למרכז רפואי שיקומי</h1>
      <p className="cs-sub">מאפיון ועד פרודקשן, מקצה לקצה.</p>
      <p className="cs-client">
        הלקוח: בית הדר, אשדוד. מרכז רפואי גריאטרי ושיקומי, 11 מחלקות וצוות של כ-400 עובדים.
      </p>
      <p className="pf-live cs-status">
        <span className="pf-dot" aria-hidden="true" />
        חי בפרודקשן, בשימוש יומיומי
      </p>

      <h2>הבעיה</h2>
      <p>
        מרכז רפואי שיקומי ניהל את מפתח הנהלים הרפואיים-סיעודיים שלו בקובץ אקסל משותף, שקישר למאות
        מסמכי Word על כונן רשת. הנעילה של אקסל שברה את הקובץ בכל פעם שכמה אנשי צוות פתחו אותו
        במקביל, לא הייתה שום בקרת גישה, ולא היה תיעוד של מי קרא מה, למרות שחתימה שנתית על נוהלי ליבה
        היא דרישה רגולטורית.
      </p>

      <h2>התפקיד שלי</h2>
      <p>
        הגעתי למוסד, ישבתי עם הצוות ועם ה-IT, אפיינתי את הבעיה האמיתית ואת הדרישות (קריאה מקבילית,
        שני פרופילי גישה, מעקב קריאה לביקורת), ולקחתי את הפרויקט מקצה לקצה: עיצוב, פיתוח, פריסה ברשת
        הפנימית שלהם, והדרכת המשתמשים.
      </p>

      <h2>הפתרון</h2>
      <p>
        פורטל פנימי ב-ASP.NET Core (.NET 10) עם SQLite, בעברית מלאה (RTL), ללא שום תלות באינטרנט.
        הקטלוג הקיים הוסב אוטומטית: כתבתי מחלץ Python שקרא את ההיפר-קישורים מתוך האקסל המקורי ושימר
        את מבנה התיקיות, כך שכ-90 קישורי מסמכים עבדו מיד מול כונן הרשת הקיים, בלי קישור ידני אחד. כל
        קורא מקבל עותק עצמאי של הנוהל. אפס נעילות, כל הצוות במקביל.
      </p>

      <h2>מנגנונים מרכזיים</h2>
      <ul>
        <li>מעקב קריאה מלא (שם, ת&quot;ז, מחלקה, חותמת זמן) עם מסך ביקורת למנהלים הכולל סינון ויצוא לאקסל.</li>
        <li>ניהול קטלוג ומשתמשים מהדפדפן.</li>
        <li>הקשחת אבטחה ופרטיות: נעילת התחברות, מיסוך תעודות זהות, הגנת CSV, ומחיקת נתונים אוטומטית לפי מדיניות שמירה.</li>
        <li>ארכיטקטורה בטוחה-לעדכון: הנתונים מופרדים מהקוד, והסכמה מנוהלת ב-EF Core Migrations. עדכון עתידי לעולם לא מוחק את מה שהמוסד צבר.</li>
      </ul>

      <h2>הפריסה, החלק שמבדיל</h2>
      <p>
        התקנתי את המערכת בעצמי על שרת Windows/IIS ברשת הפנימית של המוסד, ופתרתי בדרך שרשרת תקלות
        תשתית ארגוניות אמיתיות: כונן רשת ממופה שאינו נראה לשירותי מערכת (אבחון והסבה לנתיב UNC),
        הרשאות Active Directory וההבדל בין חשבון מחשב לחשבון דומיין עבור זהות ה-Application Pool מול
        שיתוף הקבצים, וחומת אש שחסמה את הפורט. בסוף היום: האתר נגיש מכל עמדות העובדים, קבצים נפתחים
        מכונן הרשת האמיתי, והמעקב מתעד.
      </p>

      <h2>מסירה והדרכה</h2>
      <p>
        מדריך התקנה מלא ל-IT, מצגת, צ&apos;קליסט קבלה (QA), לומדה אינטראקטיבית בעברית עם בוחן, ותיעוד
        &quot;כמו-שהותקן&quot; מלא ברפו פרטי.
      </p>

      <h2>תוצאה</h2>
      <p>
        המערכת חיה בפרודקשן ובשימוש יומיומי, ועודכנה בלי לגעת בנתונים שהמוסד צבר. המוסד
        חזר להמשך: פורטל שמאחד את המערכת הזאת ושתי מערכות חדשות תחת התחברות אחת, והוא בבנייה עכשיו.
      </p>

      <div className="cs-tags">
        {TAGS.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}

export default function CaseStudy() {
  const [lang, setLang] = useState<"en" | "he">("en")

  return (
    <main className="cs-stage">
      <article className="cs-wrap">
        <div className="cs-topbar">
          <button
            type="button"
            className="pf-btn pf-btn-small"
            onClick={() => setLang((l) => (l === "en" ? "he" : "en"))}
            aria-label={lang === "en" ? "Switch to Hebrew" : "החלף לאנגלית"}
          >
            {lang === "en" ? "עברית" : "English"}
          </button>
        </div>

        {lang === "en" ? <EnglishContent /> : <HebrewContent />}
      </article>
    </main>
  )
}
