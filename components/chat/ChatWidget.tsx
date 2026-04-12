"use client"

import { useChat } from "@ai-sdk/react"
import { useRef, useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"

export default function ChatWidget() {
  const [input, setInput] = useState("")
  const [rateLimited, setRateLimited] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    onError: (err) => {
      if (err.message?.includes("429") || err.message?.includes("Rate")) {
        setRateLimited(true)
      }
    },
  })

  const isLoading = status === "submitted" || status === "streaming"

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || rateLimited) return
    sendMessage({ text: input.trim() })
    setInput("")
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <section id="chat" aria-labelledby="chat-heading" className="py-20 px-4 sm:px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <h2 id="chat-heading" className="text-2xl font-bold mb-3 text-[var(--foreground)]">
          Ask the AI
        </h2>
        <p className="text-sm text-[var(--muted)] mb-8">
          An AI assistant trained on Nathan&apos;s profile. Ask about his projects, experience, or background.
        </p>

        {/* Chat panel */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)] max-w-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--foreground)]">Nathan&apos;s AI</span>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto">
            <ChatMessages messages={messages} isLoading={isLoading} />
            <div ref={bottomRef} aria-hidden="true" />
          </div>

          {/* Error / rate limit */}
          {(error || rateLimited) && (
            <div
              role="alert"
              className="mx-3 mb-2 px-3 py-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-800 rounded-lg"
            >
              {rateLimited
                ? "Rate limit reached. Come back in an hour."
                : "Something went wrong. Please try again."}
            </div>
          )}

          {/* Input */}
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            disabled={rateLimited}
          />
        </div>
      </div>
    </section>
  )
}
