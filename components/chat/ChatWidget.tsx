"use client"

import { useChat } from "@ai-sdk/react"
import { useRef, useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"

const suggestions = [
  "What's AutoMates actually doing?",
  "Tell me about Polaris and IBM",
  "Is Nathan available?",
  "Walk me through the 2FA idea",
]

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

  const send = (text: string) => {
    if (!text.trim() || isLoading || rateLimited) return
    sendMessage({ text: text.trim() })
    setInput("")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages])

  return (
    <section id="chat" aria-labelledby="chat-heading">
      <div className="wrap">
        <div className="sec-hd">
          <span className="sec-idx">08 / CONTACT</span>
          <h2 id="chat-heading" className="sec-ti">
            Let&apos;s <em>talk</em>
          </h2>
          <p className="sec-lead">Don&apos;t fill a form. Just ask.</p>
        </div>

        <div className="chat">
          <div className="chat-bar">
            <div className="trafik" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="host">tailornate.com</span>
            <span className="sep">~</span>
            <span>zsh</span>
            <span className="sep">·</span>
            <span>ask-nathan</span>
            <span className="pill-live">● online</span>
          </div>

          <div className="chat-body" role="log" aria-live="polite">
            <div className="chat-line">
              <span className="prompt">$</span>
              <span className="line-muted">ssh nathan@tailornate.com</span>
            </div>
            <div className="chat-line">
              <span className="prompt green">✓</span>
              <span className="line-muted">connected. 15 msgs/hr.</span>
            </div>

            {messages.length === 0 && (
              <>
                <div className="chat-line" style={{ marginTop: "14px" }}>
                  <span className="prompt">&gt;</span>
                  <strong>Hey. I&apos;m Nathan&apos;s AI.</strong>
                </div>
                <div className="msg">
                  Ask me about his work, his stack, or whether he&apos;s available. Warm tone. No
                  forms. Your move
                  <span className="blink" aria-hidden="true" />
                </div>
                <div className="chip-suggest">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} disabled={isLoading || rateLimited}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            <ChatMessages messages={messages} isLoading={isLoading} />
            <div ref={bottomRef} aria-hidden="true" />
          </div>

          {(error || rateLimited) && (
            <div role="alert" className="chat-alert">
              {rateLimited
                ? "rate limit reached — come back in an hour."
                : "something went wrong. try again."}
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
      </div>
    </section>
  )
}
