'use client';

import { useState, useEffect } from 'react';
import { useBridgeQuote } from '@/hooks/useBridgeQuote';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BridgeQuoteResponse } from '@/hooks/useBridgeQuote';

interface BridgeProviderSelectorProps {
  fromChain: number;
  toChain: number;
  fromToken: { address: string; decimals: number; symbol: string } | null;
  toToken: { address: string; decimals: number; symbol: string } | null;
  amount: string;
  slippage: number;
  selectedProvider: string | null;
  onSelectProvider: (provider: string | null) => void;
  className?: string;
}

export function BridgeProviderSelector({
  fromChain,
  toChain,
  fromToken,
  toToken,
  amount,
  slippage,
  selectedProvider,
  onSelectProvider,
  className,
}: BridgeProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    data: bestQuote,
    allQuotes,
    isLoading,
    isError,
    error,
    refetch,
  } = useBridgeQuote({
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
    slippage,
    enabled: isOpen && !!fromToken && !!toToken && !!amount && parseFloat(amount) > 0,
  });
  
  // Set the best provider when quotes are loaded
  useEffect(() => {
    if (bestQuote && !selectedProvider) {
      onSelectProvider(bestQuote.provider);
    }
  }, [bestQuote, selectedProvider, onSelectProvider]);
  
  // Get the selected quote
  const selectedQuote = allQuotes.find(q => q.provider === selectedProvider) || bestQuote;
  
  // Format the amount with fee for display
  const formatAmountWithFee = (quote: BridgeQuoteResponse) => {
    if (!quote) return '';
    
    const amount = parseFloat(quote.amountOut);
    const fee = parseFloat(quote.fee);
    const total = (amount + fee).toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    });
    
    return `${total} ${quote.toToken.symbol}`;
  };
  
  // Format the estimated time
  const formatEstimatedTime = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} min`;
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Bridge Provider</span>
        
        {selectedQuote && (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Receiving:</span>
            <span className="font-medium text-foreground">
              {parseFloat(selectedQuote.amountOut).toLocaleString(undefined, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 8,
              })}{' '}
              {selectedQuote.toToken.symbol}
            </span>
          </div>
        )}
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-12"
            disabled={isLoading || isError || allQuotes.length === 0}
          >
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading providers...</span>
                </>
              ) : isError ? (
                <span className="text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Failed to load providers
                </span>
              ) : selectedQuote ? (
                <>
                  {selectedQuote.providerLogo && (
                    <img 
                      src={selectedQuote.providerLogo} 
                      alt={selectedQuote.provider}
                      className="h-5 w-5 rounded-full"
                    />
                  )}
                  <span>{selectedQuote.provider}</span>
                  <span className="text-muted-foreground text-sm">
                    ~{formatEstimatedTime(selectedQuote.estimatedTime)}
                  </span>
                </>
              ) : (
                <span>Select a provider</span>
              )}
            </div>
            <ChevronDown className={cn(
              "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
              isOpen ? "rotate-180" : ""
            )} />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Loading providers...</span>
              </div>
            ) : isError ? (
              <div className="p-4 text-center">
                <AlertCircle className="h-5 w-5 mx-auto text-destructive mb-2" />
                <p className="text-sm text-destructive mb-3">
                  {error?.message || 'Failed to load bridge providers'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : allQuotes.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No bridge providers available for this route
              </div>
            ) : (
              <div className="divide-y">
                {allQuotes.map((quote) => (
                  <button
                    key={quote.provider}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                      selectedProvider === quote.provider && "bg-muted/30"
                    )}
                    onClick={() => {
                      onSelectProvider(quote.provider);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {quote.providerLogo && (
                          <img 
                            src={quote.providerLogo} 
                            alt={quote.provider}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div className="text-left">
                          <div className="font-medium">{quote.provider}</div>
                          <div className="text-xs text-muted-foreground">
                            ~{formatEstimatedTime(quote.estimatedTime)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">
                          {parseFloat(quote.amountOut).toLocaleString(undefined, {
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 8,
                          })}{' '}
                          {quote.toToken.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Fee: {parseFloat(quote.fee).toFixed(6)} {quote.feeToken.symbol}
                        </div>
                      </div>
                      
                      <div className="ml-2">
                        <Check
                          className={cn(
                            "h-4 w-4 text-primary",
                            selectedProvider === quote.provider ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </div>
                    
                    {quote.route && quote.route.length > 0 && (
                      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Route:</span>
                          <span>
                            {quote.route.map((step, i) => (
                              <span key={i}>
                                {i > 0 && ' → '}
                                {step.name}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Best provider selected</span>
              <button 
                className="text-primary hover:underline"
                onClick={() => refetch()}
              >
                Refresh
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedQuote && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Estimated time</span>
          <span>{formatEstimatedTime(selectedQuote.estimatedTime)}</span>
        </div>
      )}
      
      {selectedQuote && parseFloat(selectedQuote.fee) > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Bridge fee</span>
          <span>
            {parseFloat(selectedQuote.fee).toFixed(6)} {selectedQuote.feeToken.symbol}
          </span>
        </div>
      )}
    </div>
  );
}
