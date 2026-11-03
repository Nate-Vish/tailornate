"use client"

import type { UIMessage } from "ai"
import type { ReactNode } from "react"

function messageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("")
}

// The prompt asks for plain text, but models still slip in **bold** and bare
// URLs. Strip the asterisks and make links clickable; nothing else is parsed.
const URL_RE = /(https?:\/\/[^\s)]+[^\s).,!?])/g

function renderText(text: string): ReactNode[] {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .split(URL_RE)
    .map((chunk, i) =>
      i % 2 === 1 ? (
        <a key={i} href={chunk} target="_blank" rel="noopener noreferrer">
          {chunk.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      ) : (
        chunk
      )
    )
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
        <div
          key={m.id}
          className={`fbot-msg ${m.role === "user" ? "fbot-user" : ""}`}
          dir="auto"
        >
          {renderText(messageText(m))}
        </div>
      ))}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="fbot-msg fbot-typing" aria-label="Assistant is typing">
          <span />
          <span />
          <span />
        </div>
      )}
    </>
  )
}
