"use client"

// Opens the floating assistant from anywhere on the page.
export default function AskButton({
  className = "pf-btn pf-btn-primary",
  children = "Ask my assistant",
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("tn-open-bot"))}
    >
      {children}
    </button>
  )
}
