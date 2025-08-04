import Link from 'next/link';
import { ExternalLink, Github, Twitter, Discord } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8">
                <Logo className="h-full w-full" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Etherlink-X
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              The Cross-L2 DeFi Hub & Aggregator for Etherlink
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/etherlinkx" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://github.com/etherlink-x" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="https://discord.gg/etherlinkx" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Discord className="h-5 w-5" />
                <span className="sr-only">Discord</span>
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div className="space-y-2">
            <h3 className="font-medium">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/bridge" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bridge</Link></li>
              <li><Link href="/swap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Swap</Link></li>
              <li><Link href="/portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Portfolio</Link></li>
              <li><Link href="/transactions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Transactions</Link></li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              <li><a href="https://etherlink.com/audit" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center">
                Audits <ExternalLink className="h-3 w-3 ml-1" />
              </a></li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link href="/risks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Risk Disclosures</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/40 text-sm text-muted-foreground text-center">
          <p>© {currentYear} Etherlink-X. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
