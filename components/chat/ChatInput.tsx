"use client"

import type { ChangeEvent, FormEvent } from "react"

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
}: {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  disabled: boolean
}) {
  return (
    <form className="chat-input" onSubmit={onSubmit}>
      <span className="prmpt" aria-hidden="true">
        &gt;
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="type a question and hit enter…"
        aria-label="Message Nathan's AI assistant"
        disabled={disabled}
        maxLength={500}
      />
      <button type="submit" className="send" disabled={isLoading || disabled || !value.trim()}>
        SEND ⏎
      </button>
    </form>
  )
}
