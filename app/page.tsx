import SkipNav from "@/components/layout/SkipNav"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Hero from "@/components/sections/Hero"
import About from "@/components/sections/About"
import Projects from "@/components/sections/Projects"
import Experience from "@/components/sections/Experience"
import Education from "@/components/sections/Education"
import Community from "@/components/sections/Community"
import ChatWidget from "@/components/chat/ChatWidget"

export default function Home() {
  return (
    <>
      <SkipNav />
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Education />
        <Community />
        <ChatWidget />
      </main>
      <Footer />
    </>
  )
}
