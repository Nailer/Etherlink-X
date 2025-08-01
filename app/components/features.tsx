import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Shield, Zap, DollarSign, Globe } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute cross-chain swaps in seconds with our optimized routing algorithms.",
    },
    {
      icon: DollarSign,
      title: "Best Rates",
      description: "Access the most competitive rates across all major DEXs and bridges.",
    },
    {
      icon: Shield,
      title: "Secure & Audited",
      description: "Your funds are protected by industry-leading security practices and audits.",
    },
    {
      icon: Globe,
      title: "Multi-Chain",
      description: "Support for 20+ blockchains including Ethereum, Polygon, Arbitrum, and more.",
    },
  ]

  return (
    <section className="px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose ETHERLINK?</h2>
          <p className="mt-4 text-lg text-gray-600">The most advanced cross-chain infrastructure for DeFi</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-purple-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
