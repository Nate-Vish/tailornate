import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

// The link-preview card for every page. Matches the /portfolio palette.
export const alt = "Nathan Hai Vishnevski. I build the software care teams use every day."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  const portrait = await readFile(join(process.cwd(), "public/portrait.jpg"))
  const src = `data:image/jpeg;base64,${portrait.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f2f5f4",
          color: "#0f2229",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              color: "#0b6b5d",
              marginBottom: 28,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#1f9d58" }} />
            Live at Bet Hadar medical center
          </div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>
            I build the software care teams use every day.
          </div>
          <div style={{ fontSize: 30, color: "#4b5e64", marginTop: 32 }}>
            Nathan Hai Vishnevski, tailornate.com
          </div>
        </div>
        <img
          src={src}
          width={420}
          height={630}
          style={{ objectFit: "cover", objectPosition: "50% 20%" }}
          alt=""
        />
      </div>
    ),
    size
  )
}
