'use client';

import Link from 'next/link';
import { ArrowRight, BarChart2, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const features = [
    {
      icon: <BarChart2 className="h-6 w-6 text-primary" />,
      title: 'Optimized Routing',
      description: 'Get the best rates by automatically splitting your transactions across multiple bridges and DEXs.',
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: 'Lightning Fast',
      description: 'Experience near-instant cross-chain swaps with our optimized routing system.',
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'Secure & Trustless',
      description: 'Non-custodial solution that never holds your funds. You remain in full control.',
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: 'Multi-Chain',
      description: 'Connect and transact across all major blockchains from a single interface.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
        <div className="container py-24 md:py-32 lg:py-40">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border px-4 py-1 text-sm font-medium bg-background/80 backdrop-blur-sm mb-6">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              <span>Etherlink-X is live on mainnet</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
              The Cross-Chain DeFi Hub for{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Etherlink
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mb-10">
              Seamlessly bridge, swap, and earn across multiple L2s with the most efficient cross-chain routing protocol on Etherlink.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/bridge">
                <Button size="lg" className="gap-2">
                  Launch App <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border/40 bg-muted/20 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">$1.2B+</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">250K+</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">15+</div>
              <div className="text-sm text-muted-foreground">Chains</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">99.9%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Etherlink-X?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built the most advanced cross-chain infrastructure to power the next generation of DeFi applications.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-background border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of users already using Etherlink-X for seamless cross-chain transactions.
          </p>
          <Link href="/bridge">
            <Button size="lg" className="gap-2">
              Launch App <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
