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
      className="h-full overflow-y-auto p-4 space-y-3"
    >
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center gap-3 py-8">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg"
            style={{ background: "var(--grad-accent)" }}
            aria-hidden="true"
          >
            ✦
          </div>
          <p className="text-sm text-[var(--muted-foreground)] text-center">
            Ask me anything about Nathan.
          </p>
        </div>
      )}
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "text-white"
                : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)]"
            }`}
            style={m.role === "user" ? { background: "var(--grad-accent)" } : {}}
          >
            {getTextContent(m)}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start" aria-busy="true" aria-label="Nathan&apos;s AI is typing">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)] animate-bounce"
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
