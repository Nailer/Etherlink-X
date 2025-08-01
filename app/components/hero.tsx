import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="px-6 lg:px-8 py-20 lg:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 mb-6">
            <Zap className="mr-2 h-4 w-4" />
            Cross-chain DeFi made simple
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
          Bridge & Swap
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Any Token
          </span>
          Across Chains
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          The most efficient way to move your assets across blockchains. Access the best rates, lowest fees, and fastest
          transactions in DeFi.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg"
            asChild
          >
            <Link href="/exchange">
              Start Trading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-4 rounded-full text-lg border-purple-200 hover:bg-purple-50 bg-transparent"
          >
            View Docs
          </Button>
        </div>
      </div>
    </section>
  )
}
