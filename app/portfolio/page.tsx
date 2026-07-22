import SkipNav from "@/components/layout/SkipNav"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Hero from "@/components/sections/Hero"
import Projects from "@/components/sections/Projects"
import Stack from "@/components/sections/Stack"
import About from "@/components/sections/About"
import Experience from "@/components/sections/Experience"
import Education from "@/components/sections/Education"
import FloatingChat from "@/components/chat/FloatingChat"

export default function Home() {
  return (
    <>
      <SkipNav />
      <Header />
      <main id="main-content">
        <Hero />
        <Projects />
        <Stack />
        <About />
        <Experience />
        <Education />
      </main>
      <Footer />
      <FloatingChat />
    </>
  )
}
