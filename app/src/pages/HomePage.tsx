import { Header } from "../components/Header"
import { Hero } from "../components/Hero"
import { Features } from "../components/Features"
import { Stats } from "../components/Stats"
import { Footer } from "../components/Footer"
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";

interface HomePageProps {
  onNavigate: (page: string) => void
}

const client = createThirdwebClient({
  clientId: "98d7729918258ad22b44c37fa29c6ce67",
});

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <Header onNavigate={onNavigate} thirdwebClient={client} />
      <Hero onNavigate={onNavigate} />
      <Stats />
      <Features />
      <Footer />
    </div>
  )
}
