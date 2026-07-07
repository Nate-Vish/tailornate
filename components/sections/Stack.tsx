"use client"

import { useState } from "react"
import { keySkills, skillCategories } from "@/content/skills"

export default function Stack() {
  const [open, setOpen] = useState(false)

  return (
    <section id="stack" aria-labelledby="stack-heading">
      <div className="wrap">
        <div className="sec-hd">
          <span className="sec-idx">03 / TOOLKIT</span>
          <h2 id="stack-heading" className="sec-ti">
            <em>Stack</em>
          </h2>
          <p className="sec-lead">
            AI systems and data-driven decisions — sharpest tools first.
          </p>
        </div>

        <div className="pills">
          {keySkills.map((s) => (
            <span key={s} className="pill key">
              {s}
            </span>
          ))}
        </div>

        <button
          className={`expand-btn${open ? " open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="full-stack"
        >
          <span>{open ? "Close skillset" : "Full skillset"}</span>
          <svg
            className="chev"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div id="full-stack" className={`full-stack${open ? " open" : ""}`}>
          <div className="cat-grid">
            {skillCategories.map((cat) => (
              <div key={cat.name} className="cat">
                <h4>{cat.name}</h4>
                <ul>
                  {cat.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
