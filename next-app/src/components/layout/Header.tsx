'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { WalletButton } from './WalletButton';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

export function Header() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Bridge', href: '/bridge' },
    { name: 'Swap', href: '/swap' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Transactions', href: '/transactions' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Etherlink-X
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  'h-10 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
                  pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
