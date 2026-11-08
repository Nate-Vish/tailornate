"use client"

export default function PrintButton() {
  return (
    <button type="button" className="pf-btn pf-btn-small rs-print" onClick={() => window.print()}>
      Save as PDF
    </button>
  )
}
