import Link from "next/link"

export const metadata = { title: "תנאי שימוש | Sidra" }

const updated = "9 ביולי 2026"

export default function TermsPage() {
  return (
    <article className="space-y-5 text-[15px] leading-relaxed text-foreground">
      <header>
        <h1 className="text-[24px] font-semibold">תנאי שימוש — Sidra</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">עודכן לאחרונה: {updated}</p>
      </header>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">השירות</h2>
        <p>
          Sidra היא אפליקציית ניהול משימות בשלב ניסוי מוקדם (Beta). השימוש בה אישי ובאחריות
          המשתמש. השירות עשוי להשתנות, להיפסק או להתאפס ללא הודעה מוקדמת בשלב זה.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">אחריות</h2>
        <p>
          השירות ניתן כפי-שהוא (AS-IS), ללא אחריות מכל סוג. הנתונים נשמרים מקומית במכשירך —
          באחריותך לגבותם (ייצוא CSV/ICS זמין באפליקציה). לא נהיה אחראים לאובדן נתונים, נזק
          ישיר או עקיף הנובע מהשימוש.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">תוכן ה-AI</h2>
        <p>
          תשובות עוזר ה-AI מיוצרות אוטומטית ועשויות לטעות. הן אינן ייעוץ מקצועי מכל סוג, ואין
          להסתמך עליהן ככזה.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">שימוש הוגן</h2>
        <p>
          אין לעשות שימוש לרעה בשירות, לרבות ניסיונות עקיפת קוד הגישה, העמסה מכוונת על ממשקי
          ה-API או שימוש מסחרי ללא הסכמה.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">דין חל</h2>
        <p>על תנאים אלה יחול הדין הישראלי, וסמכות השיפוט הבלעדית נתונה לבתי המשפט בישראל.</p>
      </section>

      <section className="text-[13px] text-muted-foreground">
        <p>
          English summary: Sidra is an early-stage beta provided as-is, without warranty. Data
          lives on your device — back it up via the in-app CSV/ICS export. AI output may be
          wrong and is not professional advice. Israeli law governs.
        </p>
      </section>

      <footer className="border-t border-border pt-4 text-[13px]">
        <Link href="/legal/privacy" className="underline">
          מדיניות פרטיות
        </Link>
        <span className="mx-2 text-muted-foreground">·</span>
        <Link href="/tasks" className="underline">
          חזרה ל-Sidra
        </Link>
        <span className="mx-2 text-muted-foreground">·</span>
        <Link href="/portfolio" className="underline">
          tailornate.com
        </Link>
      </footer>
    </article>
  )
}
