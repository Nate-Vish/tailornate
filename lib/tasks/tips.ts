// A curated, slowly-growing pool of short thoughts shown on entry.
// Nathan approves every addition — keep them light, sharp, never preachy.
export const TIPS: string[] = [
  "משימה של שתי דקות? עכשיו זה הזמן.",
  "הדרך הכי מהירה לסיים משהו גדול — להתחיל משהו קטן.",
  "מה שלא נכתב — נשכח. מה שנכתב — נסגר.",
  "היום המושלם לא יגיע. יש רק את היום.",
  "אם הכל דחוף, כלום לא דחוף. תבחר אחד.",
  "לדחות זה גם החלטה. לפחות תקבל אותה בכוונה.",
  "התקדמות קטנה כל יום מנצחת ספרינט פעם בחודש.",
  "עייף? תסגור משהו קצר. המומנטום יעשה את השאר.",
  "אי אפשר לנווט בלי לדעת איפה אתה עומד.",
  "משימה גדולה מפחידה? שלושה חלקים קטנים — כבר לא.",
  "מה הדבר האחד שאם תסגור היום, היום היה שווה?",
  "הראש נועד לחשוב, לא לזכור. תזרוק הכל לרשימה.",
  "כל ✓ קטן הוא הבטחה שקיימת לעצמך.",
  "אל תפתח עוד טאב. תסגור עוד משימה.",
  "קפה ביד? מושלם. עכשיו אחת קצרה.",
  "גם עצירה לנשום היא חלק מהניווט.",
]

// One thought per day — deliberately not per-visit, so it has time to land.
export function tipOfTheDay(dateISO: string): string {
  let hash = 0
  for (const ch of dateISO) hash = (hash * 31 + ch.charCodeAt(0)) % 100000
  return TIPS[hash % TIPS.length]
}
