import { Header } from "@/components/header"
import { ExchangeWidget } from "@/components/exchange-widget"

export default function ExchangePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-purple-900">
      <Header />
      <main className="flex items-center justify-center px-6 py-12">
        <ExchangeWidget />
      </main>
    </div>
  )
}
