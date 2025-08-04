'use client';

import { useState, useEffect } from 'react';
import { Chain } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChains } from '@/hooks/useChains';

interface ChainSelectorProps {
  selectedChainId: number;
  onSelectChain: (chainId: number) => void;
  excludeChainId?: number;
  className?: string;
  disabled?: boolean;
}

export function ChainSelector({
  selectedChainId,
  onSelectChain,
  excludeChainId,
  className,
  disabled = false,
}: ChainSelectorProps) {
  const [open, setOpen] = useState(false);
  const { chains, isLoading, error } = useChains();
  
  // Filter out the excluded chain if needed
  const filteredChains = excludeChainId 
    ? chains.filter(chain => chain.id !== excludeChainId)
    : chains;
  
  const selectedChain = chains.find(chain => chain.id === selectedChainId);
  
  // If the selected chain is excluded, select the first available chain
  useEffect(() => {
    if (!isLoading && !error && chains.length > 0) {
      if (!selectedChain || (excludeChainId && selectedChainId === excludeChainId)) {
        const firstAvailableChain = filteredChains[0];
        if (firstAvailableChain) {
          onSelectChain(firstAvailableChain.id);
        }
      }
    }
  }, [isLoading, error, chains, selectedChain, excludeChainId, filteredChains, onSelectChain]);

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
        Failed to load chains
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
            !selectedChain && 'text-muted-foreground',
            className
          )}
          disabled={disabled || filteredChains.length === 0}
        >
          <div className="flex items-center space-x-2">
            {selectedChain ? (
              <>
                <img 
                  src={selectedChain.icon} 
                  alt={selectedChain.name} 
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{selectedChain.name}</span>
              </>
            ) : (
              <span>Select chain</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="max-h-[400px] overflow-y-auto p-1">
          {filteredChains.map((chain) => (
            <div
              key={chain.id}
              className={cn(
                'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground',
                'cursor-pointer',
                selectedChainId === chain.id && 'bg-accent/50'
              )}
              onClick={() => {
                onSelectChain(chain.id);
                setOpen(false);
              }}
            >
              <img 
                src={chain.icon} 
                alt={chain.name} 
                className="w-5 h-5 rounded-full mr-2"
              />
              <span className="flex-1">{chain.name}</span>
              {selectedChainId === chain.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          ))}
          
          {filteredChains.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No chains available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
