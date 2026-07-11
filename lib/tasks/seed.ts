import type { Category, Tag, Task, Weights } from "./types"

export const seedCategories: Category[] = [
  { id: "cat_projects", name: "פרויקטים", nameEn: "Projects", color: "#2f6da8", icon: "star" },
  { id: "cat_studies", name: "לימודים", nameEn: "Studies", color: "#6a5acd", icon: "graduation-cap" },
  { id: "cat_career", name: "קריירה", nameEn: "Career", color: "#b07a2a", icon: "briefcase" },
  { id: "cat_personal", name: "אישי", nameEn: "Personal", color: "#6e6a5e", icon: "user" },
  { id: "cat_family", name: "משפחה", nameEn: "Family", color: "#b25070", icon: "heart" },
]

export const seedTags: Tag[] = [
  { id: "tag_polaris", name: "Polaris", categoryId: "cat_projects", color: "#2f6da8", icon: "chart-line" },
  { id: "tag_automates", name: "AutoMates", categoryId: "cat_projects", color: "#1d8a68", icon: "robot" },
  { id: "tag_sunny", name: "Sunny", categoryId: "cat_projects", color: "#d0662f", icon: "sun" },
  { id: "tag_hit", name: "HIT", categoryId: "cat_studies", color: "#6a5acd", icon: "graduation-cap" },
  { id: "tag_linkedin", name: "לינקדאין", categoryId: "cat_career", color: "#b07a2a", icon: "at-sign" },
  { id: "tag_home", name: "בית", categoryId: "cat_personal", color: "#6e6a5e", icon: "home" },
  { id: "tag_health", name: "בריאות", categoryId: "cat_personal", color: "#4a8a3a", icon: "heart-pulse" },
  { id: "tag_meital", name: "מיטל", categoryId: "cat_family", color: "#b25070", icon: "heart" },
]

const dayISO = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  // LOCAL date — toISOString() is UTC and would shift the calendar day.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const now = () => new Date().toISOString()

export const seedTasks: Task[] = [
  { id: "t_1", title: "להעביר את אילון לאש", priority: "urgent", size: "short", status: "in_progress", categoryId: "cat_projects", tagId: "tag_polaris", createdAt: now() },
  { id: "t_2", title: "פגישה עם מיטל", priority: "urgent", size: "short", status: "not_started", categoryId: "cat_family", tagId: "tag_meital", dueDate: dayISO(2), createdAt: now() },
  { id: "t_3", title: "לגייס את אמיר פלדנר", priority: "urgent", size: "medium", status: "in_progress", categoryId: "cat_projects", tagId: "tag_polaris", dueDate: dayISO(1), createdAt: now() },
  { id: "t_4", title: "פוסט לינקדאין HZLeaders", priority: "high", size: "medium", status: "in_progress", categoryId: "cat_career", tagId: "tag_linkedin", createdAt: now() },
  { id: "t_5", title: "חידוש רישיון נשק", priority: "urgent", size: "medium", status: "not_started", categoryId: "cat_personal", dueDate: dayISO(-2), createdAt: now() },
  { id: "t_6", title: "לפצל את Forge לשלבים", priority: "high", size: "medium", status: "not_started", categoryId: "cat_projects", tagId: "tag_automates", createdAt: now() },
  { id: "t_7", title: "לעצב את מסך הזיכרון של Sunny", priority: "medium", size: "long", status: "not_started", categoryId: "cat_projects", tagId: "tag_sunny", createdAt: now() },
  { id: "t_8", title: "לערער על דוח חניה", priority: "urgent", size: "short", status: "not_started", categoryId: "cat_personal", dueDate: dayISO(5), createdAt: now() },
  { id: "t_9", title: "תרגיל בתורת הקומפילציה", priority: "high", size: "long", status: "not_started", categoryId: "cat_studies", tagId: "tag_hit", dueDate: dayISO(4), createdAt: now() },
  { id: "t_10", title: "לסדר את החדר", priority: "low", size: "short", status: "not_started", categoryId: "cat_personal", tagId: "tag_home", createdAt: now() },
  { id: "t_11", title: "להסתפר", priority: "low", size: "short", status: "in_progress", categoryId: "cat_personal", dueDate: dayISO(0), createdAt: now() },
  { id: "t_12", title: "להגיש דוח רבעוני", priority: "high", size: "medium", status: "not_started", categoryId: "cat_career", dueDate: dayISO(12), createdAt: now() },
  { id: "t_13", title: "יום הולדת לאבא", priority: "medium", size: "short", status: "not_started", categoryId: "cat_family", dueDate: dayISO(12), createdAt: now() },
  { id: "t_14", title: "מבחן בקומפילציה", priority: "urgent", size: "long", status: "not_started", categoryId: "cat_studies", tagId: "tag_hit", dueDate: dayISO(18), createdAt: now() },
  { id: "t_15", title: "לארוז מזוודה", priority: "medium", size: "short", status: "not_started", categoryId: "cat_personal", dueDate: dayISO(25), createdAt: now() },
  { id: "t_done_1", title: "לענות למייל של דנה", priority: "medium", size: "short", status: "completed", categoryId: "cat_career", tagId: "tag_linkedin", createdAt: now(), completedAt: now() },
  { id: "t_done_2", title: "לקבוע ריצה עם אבא", priority: "low", size: "short", status: "completed", categoryId: "cat_family", createdAt: now(), completedAt: now() },
  { id: "t_done_3", title: "להתקין את הפלאגין החדש", priority: "medium", size: "short", status: "completed", categoryId: "cat_projects", tagId: "tag_automates", createdAt: now(), completedAt: now() },
]

// Priority dominates by design — "what matters" must not be diluted by task
// size. Size stays a light quick-win nudge.
export const defaultWeights: Weights = { priority: 45, deadline: 30, status: 15, size: 10 }
