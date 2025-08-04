"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits, zeroAddress, Address } from 'viem';
import { useBridgeForm } from '@/hooks/useBridgeForm';
import { useBridgeQuote } from '@/hooks/useBridgeQuote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TokenSelector } from './TokenSelector';
import { ChainSelector } from './ChainSelector';
import { BridgeProviderSelector } from './BridgeProviderSelector';
import { 
  ArrowDown, 
  ArrowRight, 
  ArrowUpDown, 
  Clock, 
  ExternalLink, 
  Info, 
  Loader2, 
  Settings, 
  Shield, 
  Sparkles, 
  Wallet, 
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency, formatTokenAmount } from '@/lib/utils';
import { formatTransactionStatus, formatRelativeTime, formatTransactionHash } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { TokenWithLogo, ChainExtended, BridgeProvider, BridgeTransaction, BridgeQuote, BridgeFormState } from './BridgeForm.types';

// Mock data - will be replaced with real data from the API
const MOCK_TOKENS: TokenWithLogo[] = [];
const MOCK_CHAINS: ChainExtended[] = [];
const MOCK_PROVIDERS: BridgeProvider[] = [];
const MOCK_TRANSACTIONS: BridgeTransaction[] = [];

export function BridgeForm() {
  // Form state
  const [fromChain, setFromChain] = useState<ChainExtended | null>(null);
  const [toChain, setToChain] = useState<ChainExtended | null>(null);
  const [fromToken, setFromToken] = useState<TokenWithLogo | null>(null);
  const [toToken, setToToken] = useState<TokenWithLogo | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [isBridging, setIsBridging] = useState(false);
  const [showRecipient, setShowRecipient] = useState(false);
  const [activeTab, setActiveTab] = useState('bridge');
  
  // Wallet and connection
  const { address } = useAccount();
  
  // Token balance
  const { data: tokenBalance, isLoading: isLoadingBalance } = useBalance({
    address: address as Address,
    token: fromToken?.address !== zeroAddress ? (fromToken?.address as Address) : undefined,
    chainId: fromChain?.id,
  });
  
  // Format token balance for display
  const formattedBalance = useMemo(() => {
    if (!tokenBalance) return '0';
    return formatTokenAmount(tokenBalance.value, tokenBalance.decimals, 4);
  }, [tokenBalance]);
  
  // Bridge quote
  const { data: quoteData, isLoading: isLoadingQuote, error: quoteError } = useBridgeQuote({
    fromChainId: fromChain?.id,
    toChainId: toChain?.id,
    fromToken: fromToken?.address,
    toToken: toToken?.address,
    amount: amount ? parseUnits(amount, fromToken?.decimals || 18).toString() : '0',
    recipient: showRecipient ? recipient : address,
    slippage: parseFloat(slippage) || 0.5,
  });
  
  // Handle amount change with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  // Handle max amount
  const handleMaxAmount = () => {
    if (tokenBalance) {
      setAmount(formatUnits(tokenBalance.value, tokenBalance.decimals));
    }
  };
  
  // Handle chain switch
  const handleSwitchChains = () => {
    const tempChain = fromChain;
    setFromChain(toChain);
    setToChain(tempChain);
    
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromChain || !toChain || !fromToken || !toToken || !amount) return;
    
    setIsBridging(true);
    try {
      // TODO: Implement bridge transaction
      console.log('Bridging', amount, fromToken.symbol, 'from', fromChain.name, 'to', toChain.name);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Bridge error:', error);
    } finally {
      setIsBridging(false);
    }
  };
  
  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      !!fromChain &&
      !!toChain &&
      !!fromToken &&
      !!toToken &&
      parseFloat(amount) > 0 &&
      (!showRecipient || (showRecipient && recipient))
    );
  }, [fromChain, toChain, fromToken, toToken, amount, showRecipient, recipient]);
  
  return (
    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        {/* Bridge Tab */}
        <TabsContent value="bridge" className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From Chain and Token */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="from-chain">From</Label>
                <div className="text-xs text-muted-foreground">
                  Balance: {isLoadingBalance ? <Skeleton className="inline-block h-4 w-16" /> : formattedBalance} {fromToken?.symbol}
                </div>
              </div>
              <div className="flex gap-2">
                <ChainSelector
                  selectedChain={fromChain}
                  onSelect={setFromChain}
                  chains={MOCK_CHAINS}
                  className="w-1/3"
                />
                <TokenSelector
                  selectedToken={fromToken}
                  onSelect={setFromToken}
                  tokens={MOCK_TOKENS.filter(token => token.chainId === fromChain?.id)}
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Switch Chains Button */}
            <div className="flex justify-center -my-2">
              <button
                type="button"
                onClick={handleSwitchChains}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Switch chains"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
            
            {/* To Chain and Token */}
            <div className="space-y-2">
              <Label htmlFor="to-chain">To</Label>
              <div className="flex gap-2">
                <ChainSelector
                  selectedChain={toChain}
                  onSelect={setToChain}
                  chains={MOCK_CHAINS}
                  className="w-1/3"
                />
                <TokenSelector
                  selectedToken={toToken}
                  onSelect={setToToken}
                  tokens={MOCK_TOKENS.filter(token => token.chainId === toChain?.id)}
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pr-20 text-lg py-6"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    MAX
                  </button>
                  <div className="text-sm font-medium text-muted-foreground">
                    {fromToken?.symbol || '--'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                ≈ $0.00
              </div>
            </div>
            
            {/* Recipient (optional) */}
            {showRecipient && (
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient (optional)</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
            )}
            
            {/* Slippage Settings */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Slippage tolerance</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>Your transaction will revert if the price changes unfavorably by more than this percentage.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    type="button" 
                    className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>{slippage}%</span>
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="slippage">Max slippage</Label>
                        <div className="relative w-20">
                          <Input
                            id="slippage"
                            type="text"
                            value={slippage}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                setSlippage(value);
                              }
                            }}
                            className="pr-6 text-right"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['0.1', '0.5', '1.0'].map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={slippage === value ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => setSlippage(value)}
                          >
                            {value}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Bridge Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isBridging}
              className="w-full py-6 text-base font-medium"
            >
              {isBridging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bridging...
                </>
              ) : (
                'Bridge Now'
              )}
            </Button>
            
            {/* Toggle Recipient */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowRecipient(!showRecipient)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                {showRecipient ? (
                  <>
                    <X className="mr-1 h-3 w-3" />
                    Cancel
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-1 h-3 w-3" />
                    Add recipient
                  </>
                )}
              </button>
            </div>
          </form>
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {MOCK_TRANSACTIONS.length > 0 ? (
              MOCK_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {tx.amount} {tx.fromToken} → {tx.toToken}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatRelativeTime(tx.timestamp)}
                      </div>
                    </div>
                    <div className="text-right">
                      {formatTransactionStatus(tx.status).text}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From</span>
                      <span>{tx.fromChain} → {tx.toChain}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted-foreground">Transaction</span>
                      <a 
                        href={`#`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        {formatTransactionHash(tx.txHash, 6, 4)}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Your bridge transactions will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
