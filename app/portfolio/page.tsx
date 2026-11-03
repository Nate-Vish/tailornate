import Nav from "@/components/portfolio/Nav"
import Hero from "@/components/portfolio/Hero"
import BetHadar from "@/components/portfolio/BetHadar"
import HowIBuild from "@/components/portfolio/HowIBuild"
import OtherWork from "@/components/portfolio/OtherWork"
import About from "@/components/portfolio/About"
import Contact from "@/components/portfolio/Contact"
import FloatingChat from "@/components/chat/FloatingChat"
import { grotesk, heebo } from "./fonts"
import "./portfolio.css"

export default function Portfolio() {
  return (
    <div className={`pf ${grotesk.variable} ${heebo.variable}`}>
      <a href="#main-content" className="pf-skip">
        Skip to content
      </a>
      <Nav />
      <main id="main-content">
        <Hero />
        <BetHadar />
        <HowIBuild />
        <OtherWork />
        <About />
        <Contact />
      </main>
      <FloatingChat />
    </div>
  )
}
