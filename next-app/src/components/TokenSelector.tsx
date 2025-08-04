'use client';

import { useState, useEffect } from 'react';
import { Token } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { useTokens } from '@/hooks/useTokens';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelectToken: (token: Token | null) => void;
  chainId: number;
  className?: string;
  disabled?: boolean;
}

export function TokenSelector({
  selectedToken,
  onSelectToken,
  chainId,
  className,
  disabled = false,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { tokens, isLoading, error } = useTokens(chainId);
  
  // Filter tokens based on search query
  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase() === searchQuery.toLowerCase()
  );

  // Handle token selection
  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setOpen(false);
    setSearchQuery('');
  };

  // Clear selection
  const handleClear = () => {
    onSelectToken(null);
    setSearchQuery('');
  };

  // Reset search when popover is closed
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  if (isLoading) {
    return (
      <div className={cn(
        'flex items-center justify-between px-3 py-2 border rounded-md bg-muted/50 animate-pulse',
        className
      )}>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-300"></div>
          <span className="text-sm font-medium">Loading...</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        'px-3 py-2 border rounded-md bg-destructive/10 text-destructive text-sm',
        className
      )}>
        Failed to load tokens
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-auto py-2 px-3',
            !selectedToken && 'text-muted-foreground',
            className
          )}
          disabled={disabled || tokens.length === 0}
        >
          <div className="flex items-center space-x-2">
            {selectedToken ? (
              <>
                <img 
                  src={selectedToken.logoURI} 
                  alt={selectedToken.symbol} 
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    // Fallback to a generic token icon if the image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/tokens/default-token.svg';
                  }}
                />
                <span className="font-medium">{selectedToken.symbol}</span>
              </>
            ) : (
              <span>Select token</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search token or paste address"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {filteredTokens.length > 0 ? (
            <div className="py-1">
              {filteredTokens.map((token) => (
                <div
                  key={`${token.chainId}-${token.address}`}
                  className={cn(
                    'relative flex items-center px-4 py-2 text-sm cursor-pointer',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground',
                    selectedToken?.address === token.address && 'bg-accent/50'
                  )}
                  onClick={() => handleSelectToken(token)}
                >
                  <img 
                    src={token.logoURI} 
                    alt={token.symbol} 
                    className="w-6 h-6 rounded-full mr-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/tokens/default-token.svg';
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>
                  {token.balance && (
                    <div className="text-right">
                      <div className="font-medium">{token.balance}</div>
                      {token.priceUSD && (
                        <div className="text-xs text-muted-foreground">
                          ${(parseFloat(token.balance) * parseFloat(token.priceUSD)).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedToken?.address === token.address && (
                    <Check className="h-4 w-4 text-primary ml-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <div className="text-muted-foreground text-sm">
                {searchQuery ? 'No tokens found' : 'No tokens available'}
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
        
        {selectedToken && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
