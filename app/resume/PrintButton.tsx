"use client"

export default function PrintButton() {
  return (
    <button className="resume-print" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  )
}
