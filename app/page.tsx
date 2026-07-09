import { redirect } from "next/navigation"

// The public site lives at /portfolio. The root stays a redirect (307, not
// permanent) so it can become a private hub later without fighting browser
// redirect caches. URL hashes (/#education) survive the redirect in browsers.
export default function Home() {
  redirect("/portfolio")
}
