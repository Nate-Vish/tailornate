"use client"

import { useChat } from "@ai-sdk/react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import ChatMessages from "./ChatMessages"

const CHIPS = [
  { he: "מה נתן עושה?", en: "What does Nathan do?" },
  { he: "הוא יכול לעזור לפרויקט שלי?", en: "Can he help my project?" },
  { he: "רק תחברו אותי אליו", en: "Just connect me" },
]

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [leadState, setLeadState] = useState<"idle" | "sending" | "sent" | "error" | "limit">("idle")
  const [input, setInput] = useState("")
  const [rateLimited, setRateLimited] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    onError: (err) => {
      if (err.message?.includes("429") || err.message?.includes("Rate")) setRateLimited(true)
    },
  })
  const isLoading = status === "submitted" || status === "streaming"

  // Auto-open once per session, a few seconds after arrival (research: delayed
  // proactive beats instant popup and passive badge).
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.innerWidth < 900) return
    if (sessionStorage.getItem("tn.bot.seen")) return
    const t = setTimeout(() => {
      setOpen(true)
      sessionStorage.setItem("tn.bot.seen", "1")
    }, 4500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages, showForm, leadState])

  // Hero "Let's talk" button and any other trigger open the panel.
  useEffect(() => {
    const openBot = () => setOpen(true)
    window.addEventListener("tn-open-bot", openBot)
    return () => window.removeEventListener("tn-open-bot", openBot)
  }, [])

  const send = (text: string) => {
    if (!text.trim() || isLoading || rateLimited) return
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
        <button className="fbot-pill" onClick={() => setOpen(true)} aria-label="Chat with Nathan's bot">
          <span className="dot" aria-hidden="true" />
          <span>דברו איתי · Talk to me</span>
        </button>
      )}

      {open && (
        <div className="fbot-panel" role="dialog" aria-label="Nathan's bot">
          <div className="fbot-head">
            <img src="/portrait.jpg" alt="" className="fbot-avatar" />
            <div className="fbot-id">
              <b>הבוט של נתן · Nathan&apos;s bot</b>
              <span>● online · replies instantly</span>
            </div>
            <button className="fbot-x" onClick={() => setOpen(false)} aria-label="Minimize chat">
              ×
            </button>
          </div>

          <div className="fbot-body" role="log" aria-live="polite">
            <div className="msg fbot-hello">
              היי, אני כאן בשם נתן. רוצים את גרסת 20 השניות של מה שהוא עושה, או שכבר יודעים
              ורוצים פשוט ליצור קשר?
              <br />
              <span className="fbot-hello-en">
                Hi, I&apos;m here on Nathan&apos;s behalf. Want the 20 second version of what he
                does, or shall I just connect you?
              </span>
            </div>

            {messages.length === 0 && (
              <div className="chip-suggest fbot-chips">
                {CHIPS.map((c) => (
                  <button key={c.en} onClick={() => send(c.he + " / " + c.en)} disabled={isLoading || rateLimited}>
                    {c.he}
                  </button>
                ))}
              </div>
            )}

            <ChatMessages messages={messages} isLoading={isLoading} />

            {rateLimited && (
              <div className="chat-alert">הגעת למגבלת ההודעות לשעה. אפשר פשוט להשאיר פרטים למטה.</div>
            )}

            {showForm && leadState !== "sent" && (
              <form className="fbot-lead" onSubmit={submitLead}>
                <b>נתן יחזור אליכם אישית, בדרך כלל תוך 24 שעות.</b>
                <input name="name" placeholder="שם / Name" required minLength={2} maxLength={80} />
                <input name="email" type="email" placeholder="אימייל / Email" required maxLength={254} />
                <textarea name="note" placeholder="על מה מדובר? (לא חובה)" maxLength={600} rows={2} />
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="fbot-hp" />
                <button type="submit" disabled={leadState === "sending"}>
                  {leadState === "sending" ? "שולח..." : "שלח לנתן · Send to Nathan"}
                </button>
                <span className="fbot-privacy">הולך ישירות לנתן. בלי ספאם, בלי רשימות תפוצה.</span>
                {leadState === "error" && (
                  <span className="chat-alert">משהו השתבש. אפשר גם במייל: natan.vish100@gmail.com</span>
                )}
                {leadState === "limit" && (
                  <span className="chat-alert">הגעת למגבלה היומית. נשמח לשמוע ממך במייל.</span>
                )}
              </form>
            )}

            {leadState === "sent" && (
              <div className="msg fbot-sent">נשלח! נתן יחזור אליכם בקרוב. תודה.</div>
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
                placeholder="שאלו אותי משהו · ask me anything"
                disabled={rateLimited}
                maxLength={500}
              />
              <button type="submit" disabled={isLoading || rateLimited || !input.trim()} aria-label="Send">
                ↑
              </button>
            </form>
            <button className="fbot-leadbtn" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "סגירת טופס" : "השארת פרטים · Leave details"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
