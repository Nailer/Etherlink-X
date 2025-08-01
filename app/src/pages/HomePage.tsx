import { Header } from "../components/Header"
import { Hero } from "../components/Hero"
import { Features } from "../components/Features"
import { Stats } from "../components/Stats"
import { Footer } from "../components/Footer"

interface HomePageProps {
  onNavigate: (page: string) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <Header onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <Stats />
      <Features />
      <Footer />
    </div>
  )
}
