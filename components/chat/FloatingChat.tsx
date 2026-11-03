"use client"

import { useChat } from "@ai-sdk/react"
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import ChatMessages from "./ChatMessages"
import { profile } from "@/content/profile"

// Each chip sends one language, so the bot answers in that language.
const CHIPS = [
  { label: "What does Nathan build?", text: "What does Nathan build?" },
  { label: "Could he help my organization?", text: "Could Nathan help my organization?" },
  { label: "בעברית, בבקשה", text: "היי, אפשר בעברית? ספר לי בקצרה מה נתן עושה." },
]

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [leadState, setLeadState] = useState<"idle" | "sending" | "sent" | "error" | "limit">("idle")
  const [input, setInput] = useState("")
  const [rateLimited, setRateLimited] = useState(false)
  const [injectionWarned, setInjectionWarned] = useState(false)
  const [chatLocked, setChatLocked] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    onError: (err) => {
      const m = err.message || ""
      if (m.includes("423") || m.includes("CHAT_LOCKED")) {
        setChatLocked(true)
        try {
          localStorage.setItem("tn.bot.locked", String(Date.now() + 24 * 60 * 60 * 1000))
        } catch {}
      } else if (m.includes("403") || m.includes("INJECTION_WARNING")) {
        setInjectionWarned(true)
      } else if (m.includes("429") || m.includes("Rate")) {
        setRateLimited(true)
      }
    },
  })
  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages, showForm, leadState])

  // Opening restores an active lockout from a previous visit (the server also
  // enforces it by IP for 24h).
  const openPanel = useCallback(() => {
    try {
      const until = Number(localStorage.getItem("tn.bot.locked") || 0)
      if (until && Date.now() < until) setChatLocked(true)
      else if (until) localStorage.removeItem("tn.bot.locked")
    } catch {}
    setOpen(true)
  }, [])

  // Any "Ask my assistant" button on the page opens the panel.
  useEffect(() => {
    window.addEventListener("tn-open-bot", openPanel)
    return () => window.removeEventListener("tn-open-bot", openPanel)
  }, [openPanel])

  const send = (text: string) => {
    if (!text.trim() || isLoading || rateLimited || chatLocked) return
    sendMessage({ text: text.trim() })
    setInput("")
  }

  const submitLead = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setLeadState("sending")
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          note: fd.get("note"),
          website: fd.get("website"),
        }),
      })
      if (res.ok) setLeadState("sent")
      else if (res.status === 429) setLeadState("limit")
      else setLeadState("error")
    } catch {
      setLeadState("error")
    }
  }

  return (
    <div className={`fbot ${open ? "fbot-open" : ""}`}>
      {!open && (
        <button className="fbot-pill" onClick={openPanel} aria-label="Open Nathan's assistant">
          <img src={profile.portrait} alt="" className="fbot-pill-avatar" />
          <span>Ask my assistant</span>
        </button>
      )}

      {open && (
        <div className="fbot-panel" role="dialog" aria-label="Nathan's assistant">
          <div className="fbot-head">
            <img src={profile.portrait} alt="" className="fbot-avatar" />
            <div className="fbot-id">
              <b>Nathan&apos;s assistant</b>
              <span>AI, answers about Nathan&apos;s work</span>
            </div>
            <button className="fbot-x" onClick={() => setOpen(false)} aria-label="Close assistant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="fbot-body" role="log" aria-live="polite">
            <div className="fbot-msg fbot-hello">
              Hi, I answer questions about Nathan&apos;s work. Ask me anything, or leave your
              details and he&apos;ll get back to you.
              <span className="fbot-hello-he" dir="rtl" lang="he">
                אפשר גם לכתוב לי בעברית.
              </span>
            </div>

            {messages.length === 0 && (
              <div className="chip-suggest fbot-chips">
                {CHIPS.map((c) => (
                  <button key={c.label} onClick={() => send(c.text)} disabled={isLoading || rateLimited || chatLocked}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            <ChatMessages messages={messages} isLoading={isLoading} />

            {rateLimited && (
              <div className="chat-alert">Message limit reached for this hour. You can still leave your details below.</div>
            )}

            {injectionWarned && !chatLocked && (
              <div className="chat-alert">
                זוהה ניסיון לתמרן את העוזר. ניסיון נוסף ינעל את הצ&apos;אט ל-24 שעות.
                <br />
                <span dir="ltr">That looked like an attempt to manipulate the assistant. One more and the chat locks for 24 hours.</span>
              </div>
            )}

            {chatLocked && (
              <div className="chat-alert">
                הצ&apos;אט ננעל ל-24 שעות בעקבות ניסיונות תמרון חוזרים. אפשר ליצור קשר ישירות: natan.vish100@gmail.com
                <br />
                <span dir="ltr">Chat locked for 24 hours after repeated manipulation attempts. Reach Nathan at natan.vish100@gmail.com</span>
              </div>
            )}

            {showForm && leadState !== "sent" && (
              <form className="fbot-lead" onSubmit={submitLead}>
                <b>Nathan replies personally, usually within 24 hours.</b>
                <input name="name" placeholder="Name / שם" required minLength={2} maxLength={80} />
                <input name="email" type="email" placeholder="Email / אימייל" required maxLength={254} />
                <textarea name="note" placeholder="What is it about? (optional)" maxLength={600} rows={2} />
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="fbot-hp" />
                <button type="submit" disabled={leadState === "sending"}>
                  {leadState === "sending" ? "Sending..." : "Send to Nathan"}
                </button>
                <span className="fbot-privacy">Goes straight to Nathan. No mailing lists.</span>
                {leadState === "error" && (
                  <span className="chat-alert">The form did not send. Email natan.vish100@gmail.com instead.</span>
                )}
                {leadState === "limit" && (
                  <span className="chat-alert">Daily limit reached. Email natan.vish100@gmail.com instead.</span>
                )}
              </form>
            )}

            {leadState === "sent" && (
              <div className="fbot-msg fbot-sent">Sent. Nathan will get back to you soon.</div>
            )}

            <div ref={bottomRef} aria-hidden="true" />
          </div>

          <div className="fbot-foot">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="fbot-inputrow"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Nathan's work"
                aria-label="Message"
                disabled={rateLimited || chatLocked}
                maxLength={500}
              />
              <button type="submit" disabled={isLoading || rateLimited || chatLocked || !input.trim()} aria-label="Send">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </form>
            <button className="fbot-leadbtn" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Close form" : "Leave details"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
