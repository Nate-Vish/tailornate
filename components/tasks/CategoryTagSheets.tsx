"use client"

import { useMemo, useState } from "react"
import { Sheet } from "./Sheet"
import { Icon } from "./Icon"
import { cvar } from "./pills"
import { useTasksStore } from "@/lib/tasks/store"
import type { Category, Tag } from "@/lib/tasks/types"

const PALETTE = [
  "#2f6da8", "#1d8a68", "#6a5acd", "#b25070", "#b07a2a",
  "#d0662f", "#4a8a3a", "#6e6a5e", "#b23b3b", "#4b5bbf",
]
const CATEGORY_ICONS = [
  "star", "graduation-cap", "briefcase", "user", "heart", "home",
  "heart-pulse", "dumbbell", "book-open", "plane", "music", "coffee",
  "gamepad", "cart", "dollar", "compass",
]
const TAG_ICONS = [
  "hash", "tag", "circle", "chart-line", "robot", "sun",
  "flame", "bolt", "star", "home", "book-open", "music",
]

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          aria-label={`צבע ${c}`}
          className="h-8 w-8 rounded-full transition-transform hover:scale-110"
          style={{
            background: c,
            boxShadow: value === c ? "0 0 0 2px var(--background), 0 0 0 4px " + c : "none",
          }}
        />
      ))}
    </div>
  )
}

function IconPicker({
  icons,
  value,
  color,
  onChange,
}: {
  icons: string[]
  value: string
  color: string
  onChange: (i: string) => void
}) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {icons.map((ic) => (
        <button
          key={ic}
          onClick={() => onChange(ic)}
          aria-label={ic}
          className="flex aspect-square items-center justify-center rounded-lg border transition-colors"
          style={
            value === ic
              ? { borderColor: color, background: `color-mix(in srgb, ${color} 14%, transparent)`, color }
              : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
          }
        >
          <Icon name={ic} size={18} />
        </button>
      ))}
    </div>
  )
}

function NameField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-border bg-background px-3 py-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-[var(--accent)]"
    />
  )
}

export function CategorySheet({ category, onClose }: { category?: Category; onClose: () => void }) {
  const categories = useTasksStore((s) => s.categories)
  const tags = useTasksStore((s) => s.tags)
  const tasks = useTasksStore((s) => s.tasks)
  const addCategory = useTasksStore((s) => s.addCategory)
  const updateCategory = useTasksStore((s) => s.updateCategory)
  const deleteCategory = useTasksStore((s) => s.deleteCategory)

  const editing = !!category
  const [name, setName] = useState(category?.name ?? "")
  const [color, setColor] = useState(category?.color ?? PALETTE[0])
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICONS[0])
  const [confirmDelete, setConfirmDelete] = useState(false)

  const others = categories.filter((c) => c.id !== category?.id)
  const [reassignTo, setReassignTo] = useState(others[0]?.id ?? "")
  const taskCount = category ? tasks.filter((t) => t.categoryId === category.id).length : 0
  const tagCount = category ? tags.filter((t) => t.categoryId === category.id).length : 0
  const hasContent = taskCount > 0 || tagCount > 0

  const submit = () => {
    if (!name.trim()) return
    if (editing && category) updateCategory(category.id, { name: name.trim(), color, icon })
    else addCategory({ name: name.trim(), color, icon })
    onClose()
  }

  return (
    <Sheet title={editing ? "עריכת תחום" : "תחום חדש"} onClose={onClose}>
      <div className="space-y-4">
        <NameField value={name} onChange={setName} placeholder="שם התחום (למשל: תחביבים)" />
        <div>
          <p className="mb-2 text-[11px] text-muted-foreground">צבע</p>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div>
          <p className="mb-2 text-[11px] text-muted-foreground">אייקון</p>
          <IconPicker icons={CATEGORY_ICONS} value={icon} color={color} onChange={setIcon} />
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-3 py-2.5">
          <div className="cicon flex h-9 w-9 items-center justify-center rounded-full" style={cvar(color)}>
            <Icon name={icon} size={18} />
          </div>
          <span className="text-[13px] text-foreground">{name.trim() || "תצוגה מקדימה"}</span>
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-full rounded-lg py-3 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          {editing ? "שמור" : "צור תחום"}
        </button>

        {editing && others.length > 0 && (
          <div className="border-t border-border pt-3">
            {hasContent && (
              <div className="mb-2">
                <p className="mb-1.5 text-[11px] text-muted-foreground">
                  מחיקה תעביר {taskCount} משימות ו-{tagCount} תגים אל:
                </p>
                <select
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2 py-2 text-[13px] text-foreground outline-none"
                >
                  {others.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            {confirmDelete ? (
              <button
                onClick={() => {
                  deleteCategory(category!.id, hasContent ? reassignTo : undefined)
                  onClose()
                }}
                className="w-full rounded-lg py-2.5 text-[13px] font-medium text-white"
                style={{ background: "var(--danger)" }}
              >
                בטוח? מחק את התחום
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border py-2.5 text-[13px] transition-colors"
                style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
              >
                <Icon name="trash" size={14} />
                מחק תחום
              </button>
            )}
          </div>
        )}
        {editing && others.length === 0 && (
          <p className="border-t border-border pt-3 text-center text-[11px] text-muted-foreground">
            לא ניתן למחוק את התחום היחיד.
          </p>
        )}
      </div>
    </Sheet>
  )
}

export function TagSheet({
  tag,
  categoryId,
  onClose,
}: {
  tag?: Tag
  categoryId: string
  onClose: () => void
}) {
  const categories = useTasksStore((s) => s.categories)
  const addTag = useTasksStore((s) => s.addTag)
  const updateTag = useTasksStore((s) => s.updateTag)
  const deleteTag = useTasksStore((s) => s.deleteTag)

  const editing = !!tag
  const [name, setName] = useState(tag?.name ?? "")
  const [color, setColor] = useState(tag?.color ?? PALETTE[2])
  const [icon, setIcon] = useState(tag?.icon ?? TAG_ICONS[0])
  const [catId, setCatId] = useState(tag?.categoryId ?? categoryId)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const parentCat = useMemo(() => categories.find((c) => c.id === catId), [categories, catId])

  const submit = () => {
    if (!name.trim()) return
    if (editing && tag) updateTag(tag.id, { name: name.trim(), color, icon, categoryId: catId })
    else addTag({ name: name.trim(), color, icon, categoryId: catId })
    onClose()
  }

  return (
    <Sheet title={editing ? "עריכת תג" : "תג חדש"} onClose={onClose}>
      <div className="space-y-4">
        <NameField value={name} onChange={setName} placeholder="שם התג (למשל: פרויקט X)" />
        <div>
          <p className="mb-2 text-[11px] text-muted-foreground">שייך לתחום</p>
          <select
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2 py-2 text-[13px] text-foreground outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-2 text-[11px] text-muted-foreground">צבע</p>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div>
          <p className="mb-2 text-[11px] text-muted-foreground">אייקון</p>
          <IconPicker icons={TAG_ICONS} value={icon} color={color} onChange={setIcon} />
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-3 py-2.5">
          <div className="cicon flex h-8 w-8 items-center justify-center rounded-full" style={cvar(color)}>
            <Icon name={icon} size={16} />
          </div>
          <span className="text-[13px] text-foreground">{name.trim() || "תצוגה מקדימה"}</span>
          {parentCat && <span className="text-[11px] text-muted-foreground">· {parentCat.name}</span>}
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-full rounded-lg py-3 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          {editing ? "שמור" : "צור תג"}
        </button>

        {editing && (
          <div className="border-t border-border pt-3">
            {confirmDelete ? (
              <button
                onClick={() => {
                  deleteTag(tag!.id)
                  onClose()
                }}
                className="w-full rounded-lg py-2.5 text-[13px] font-medium text-white"
                style={{ background: "var(--danger)" }}
              >
                בטוח? מחק את התג (המשימות יישארו בתחום)
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border py-2.5 text-[13px] transition-colors"
                style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
              >
                <Icon name="trash" size={14} />
                מחק תג
              </button>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}
