import { Header } from "../components/Header"
import { ExchangeWidget } from "../components/ExchangeWidget"

interface ExchangePageProps {
  onNavigate: (page: string) => void
}

export function ExchangePage({ onNavigate }: ExchangePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-purple-900">
      <Header onNavigate={onNavigate} />
      <main className="flex items-center justify-center px-6 py-12">
        <ExchangeWidget />
      </main>
    </div>
  )
}
