'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Token } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TokenSelectorProps {
  selectedToken: Token | null;
  tokens: Token[];
  onTokenSelect: (token: Token) => void;
  disabled?: boolean;
  className?: string;
}

export function TokenSelector({
  selectedToken,
  tokens,
  onTokenSelect,
  disabled = false,
  className,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    
    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query) ||
        token.address.toLowerCase() === query.toLowerCase()
    );
  }, [tokens, searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-12 text-base',
            !selectedToken && 'text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          {selectedToken ? (
            <div className="flex items-center space-x-2">
              {selectedToken.logoURI && (
                <img
                  src={selectedToken.logoURI}
                  alt={selectedToken.symbol}
                  className="h-5 w-5 rounded-full"
                />
              )}
              <span>{selectedToken.symbol}</span>
            </div>
          ) : (
            <span>Select token</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search token name or paste address"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredTokens.map((token) => (
            <button
              key={`${token.chainId}-${token.address}`}
              className={cn(
                'flex w-full items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors',
                selectedToken?.address === token.address && 'bg-muted/30'
              )}
              onClick={() => {
                onTokenSelect(token);
                setOpen(false);
                setSearchQuery('');
              }}
            >
              <div className="flex items-center space-x-3">
                {token.logoURI && (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <div className="text-left">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-muted-foreground">{token.name}</div>
                </div>
              </div>
              {token.balance && (
                <div className="text-right">
                  <div className="font-medium">
                    {parseFloat(token.balance).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}
                  </div>
                  {token.priceUSD && (
                    <div className="text-xs text-muted-foreground">
                      ${(parseFloat(token.balance) * parseFloat(token.priceUSD)).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
          {filteredTokens.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? 'No tokens found' : 'No tokens available'}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
