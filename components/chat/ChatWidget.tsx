"use client"

import { useChat } from "@ai-sdk/react"
import { useRef, useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import FadeIn from "@/components/ui/FadeIn"

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <section
      id="chat"
      aria-labelledby="chat-heading"
      className="py-24 px-4 sm:px-6 section-divider"
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            Ask the AI
          </p>
          <h2 id="chat-heading" className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
            Curious about<br />
            <span className="text-gradient">Nathan?</span>
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-10 max-w-md">
            An AI assistant trained on Nathan&apos;s full profile. Ask about his projects, background, or anything you&apos;d ask a recruiter.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          {/* Chat panel */}
          <div className="card-glow max-w-2xl border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)]">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-[var(--foreground)]">Nathan&apos;s AI</span>
              <span className="text-xs text-[var(--muted-foreground)] ml-auto">Powered by Gemma 3</span>
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
                className="mx-4 mb-3 px-4 py-2.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl"
              >
                {rateLimited
                  ? "Rate limit reached. Come back in an hour."
                  : "Something went wrong. Please try again."}
              </div>
            )}

            <ChatInput
              value={input}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              disabled={rateLimited}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
