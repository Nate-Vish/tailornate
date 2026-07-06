"use client"

import type { UIMessage } from "ai"

function messageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export default function ChatMessages({
  messages,
  isLoading,
}: {
  messages: UIMessage[]
  isLoading: boolean
}) {
  return (
    <>
      {messages.map((m) => (
        <div key={m.id}>
          <div className="chat-line" style={{ marginTop: "10px" }}>
            <span className={`prompt ${m.role === "user" ? "user" : ""}`}>
              {m.role === "user" ? "you >" : "nathan.ai >"}
            </span>
          </div>
          <div className={`msg${m.role === "user" ? " user-msg" : ""}`}>{messageText(m)}</div>
        </div>
      ))}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="chat-line" aria-label="Assistant is typing">
          <span className="prompt">&gt;</span>
          <span className="blink" aria-hidden="true" />
        </div>
      )}
    </>
  )
}
