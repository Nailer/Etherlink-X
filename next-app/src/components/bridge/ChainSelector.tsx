'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Chain } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ChainSelectorProps {
  selectedChain: Chain | null;
  chains: Chain[];
  onChainSelect: (chain: Chain) => void;
  disabled?: boolean;
  className?: string;
}

export function ChainSelector({
  selectedChain,
  chains,
  onChainSelect,
  disabled = false,
  className,
}: ChainSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-12 text-base',
            !selectedChain && 'text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          {selectedChain ? (
            <div className="flex items-center space-x-2">
              {selectedChain.icon && (
                <img
                  src={selectedChain.icon}
                  alt={selectedChain.name}
                  className="h-5 w-5 rounded-full"
                />
              )}
              <span>{selectedChain.name}</span>
            </div>
          ) : (
            <span>Select chain</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {chains.map((chain) => (
            <button
              key={chain.id}
              className={cn(
                'flex w-full items-center space-x-2 p-3 text-left hover:bg-muted/50 transition-colors',
                selectedChain?.id === chain.id && 'bg-muted/30'
              )}
              onClick={() => {
                onChainSelect(chain);
                setOpen(false);
              }}
            >
              {chain.icon && (
                <img
                  src={chain.icon}
                  alt={chain.name}
                  className="h-5 w-5 rounded-full"
                />
              )}
              <span>{chain.name}</span>
            </button>
          ))}
          {chains.length === 0 && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No chains available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
