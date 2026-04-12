import type { UIMessage } from "ai"

interface Props {
  messages: UIMessage[]
  isLoading: boolean
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("")
}

export default function ChatMessages({ messages, isLoading }: Props) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 h-full"
    >
      {messages.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center pt-4">
          Ask me anything about Nathan.
        </p>
      )}
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            {getTextContent(m)}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start" aria-busy="true" aria-label="Nathan&apos;s AI is typing">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-2.5">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                  aria-hidden="true"
                />
              ))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
