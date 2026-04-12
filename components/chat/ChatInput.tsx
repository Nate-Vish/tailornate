import type { FormEvent, ChangeEvent } from "react"

interface Props {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  disabled?: boolean
}

export default function ChatInput({ value, onChange, onSubmit, isLoading, disabled }: Props) {
  return (
    <form onSubmit={onSubmit} className="p-3 border-t border-[var(--border)] flex gap-2">
      <label htmlFor="chat-input" className="sr-only">
        Message Nathan&apos;s AI assistant
      </label>
      <input
        id="chat-input"
        type="text"
        value={value}
        onChange={onChange}
        disabled={isLoading || disabled}
        maxLength={500}
        placeholder="Ask about Nathan…"
        autoComplete="off"
        className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50 transition-colors"
      />
      <button
        type="submit"
        disabled={isLoading || disabled || !value.trim()}
        aria-label="Send message"
        className="px-3 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M1.5 1.5l13 6.5-13 6.5V9.5l9-1.5-9-1.5V1.5z" />
        </svg>
      </button>
    </form>
  )
}
