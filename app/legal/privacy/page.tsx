import Link from "next/link"

export const metadata = { title: "מדיניות פרטיות | Madko" }

const updated = "9 ביולי 2026"

export default function PrivacyPage() {
  return (
    <article className="space-y-5 text-[15px] leading-relaxed text-foreground">
      <header>
        <h1 className="text-[24px] font-semibold">מדיניות פרטיות — Madko</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">עודכן לאחרונה: {updated}</p>
      </header>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">מה זה Madko</h2>
        <p>
          Madko היא אפליקציית ניהול משימות אישית הפועלת בכתובת tailornate.com/tasks. זהו מוצר
          בשלב ניסוי מוקדם, המופעל על ידי נתן חי וישנבסקי.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">איפה הנתונים שלך</h2>
        <p>
          המשימות, התחומים, התגים וההגדרות נשמרים <b>במכשיר שלך בלבד</b> (localStorage של
          הדפדפן). הם אינם נשלחים לשרת שלנו ואינם נשמרים אצלנו. מחיקת נתוני האתר בדפדפן תמחק
          אותם לצמיתות — ייצוא CSV או ICS זמין מתוך האפליקציה לגיבוי.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">עוזר ה-AI</h2>
        <p>
          כשאתה פונה לעוזר (בטקסט או בקול), תוכן הפנייה יחד עם תמונת-מצב של המשימות שלך נשלח
          לעיבוד דרך השרת שלנו אל שירות Gemini של Google, בכפוף{" "}
          <a
            href="https://policies.google.com/privacy"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            למדיניות הפרטיות של Google
          </a>
          . אנחנו לא שומרים את התכתובות או ההקלטות; הקלטות קול נשלחות לתמלול בלבד ואינן
          נשמרות.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">חיבור יומן (אופציונלי)</h2>
        <p>
          אם תבחר לחבר יומן, כתובת ה-ICS הסודית שלו נשמרת <b>במכשיר שלך בלבד</b>. בכל בקשה
          רלוונטית היא עוברת לשרת שלנו רק כדי להביא את רשימת האירועים באותו רגע — היא אינה
          נשמרת בשרת, והאירועים אינם נאגרים. אירועי היומן נשלחים לעיבוד AI רק כשאתה מבקש
          פעולה שקשורה ליומן. ניתוק היומן בהגדרות מוחק את הכתובת מהמכשיר.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">עוגיות</h2>
        <p>
          בשימוש עוגייה אחת בלבד (sidra_gate) — אימות קוד הגישה לאזור הפרטי, בתוקף עד 180 יום.
          אין עוגיות פרסום, אין כלי אנליטיקה ואין מעקב.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">יצירת קשר</h2>
        <p>
          לכל שאלה על פרטיות: <a className="underline" href="mailto:natan.vish100@gmail.com">natan.vish100@gmail.com</a>
        </p>
      </section>

      <section className="text-[13px] text-muted-foreground">
        <p>
          English summary: Madko stores all task data locally on your device only. AI requests
          (text/voice snapshots) are processed via Google Gemini and are not stored by us. One
          functional cookie (access gate), no analytics, no ads. Contact:
          natan.vish100@gmail.com.
        </p>
      </section>

      <footer className="border-t border-border pt-4 text-[13px]">
        <Link href="/legal/terms" className="underline">
          תנאי שימוש
        </Link>
        <span className="mx-2 text-muted-foreground">·</span>
        <Link href="/tasks" className="underline">
          חזרה ל-Madko
        </Link>
        <span className="mx-2 text-muted-foreground">·</span>
        <Link href="/portfolio" className="underline">
          tailornate.com
        </Link>
      </footer>
    </article>
  )
}
