"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from 'wagmi';
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
import { cn, formatCurrency, formatTokenAmount as formatTokenAmountUtil } from '@/lib/utils';
import { formatTransactionStatus, formatRelativeTime, formatTransactionHash } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import types from shared types file
import type { Token, Chain } from '@/types';

// Extend the Token type to make logoURI required
interface TokenWithLogo extends Token {
  logoURI: string;
}

// Extend the Chain type to include required properties
interface ChainExtended extends Chain {
  rpcUrl: string;
  explorerUrl: string;
  icon: string;
  isL1?: boolean;
}

// Mock tokens for now - replace with actual token list
const MOCK_TOKENS: TokenWithLogo[] = [
  {
    address: zeroAddress,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chainId: 1,
    logoURI: '/tokens/eth.png',
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 1,
    logoURI: '/tokens/usdc.png',
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    chainId: 1,
    logoURI: '/tokens/usdt.png',
  },
  {
    address: zeroAddress,
    symbol: 'XTZ',
    name: 'Tezos',
    decimals: 6,
    chainId: 1729,
    logoURI: '/tokens/xtz.png',
  },
];

// Mock chains for now - replace with actual chain list
const MOCK_CHAINS: ChainExtended[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR-INFURA-KEY',
    explorerUrl: 'https://etherscan.io',
    icon: '/chains/ethereum.png',
    isL1: true,
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    icon: '/chains/arbitrum.png',
  },
  {
    id: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    icon: '/chains/optimism.png',
  },
  {
    id: 1729,
    name: 'Etherlink',
    rpcUrl: 'https://rpc.etherlink.com',
    explorerUrl: 'https://explorer.etherlink.com',
    icon: '/chains/etherlink.png',
  },
];

// Mock bridge providers
const MOCK_PROVIDERS = [
  {
    id: 'connext',
    name: 'Connext',
    logo: '/providers/connext.png',
    fee: '0.05',
    timeEstimate: 180, // 3 minutes in seconds
  },
  {
    id: 'hop',
    name: 'Hop Protocol',
    logo: '/providers/hop.png',
    fee: '0.1',
    timeEstimate: 300, // 5 minutes in seconds
  },
  {
    id: 'across',
    name: 'Across',
    logo: '/providers/across.png',
    fee: '0.08',
    timeEstimate: 240, // 4 minutes in seconds
  },
];

// Mock recent transactions
const MOCK_TRANSACTIONS = [
  {
    id: '0x123...456',
    fromChain: 1,
    toChain: 1729,
    fromToken: 'ETH',
    toToken: 'ETH',
    amount: '0.5',
    status: 'pending',
    timestamp: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
    txHash: '0x123...456',
  },
  {
    id: '0x789...012',
    fromChain: 1,
    toChain: 1729,
    fromToken: 'USDC',
    toToken: 'USDC',
    amount: '1000',
    status: 'completed',
    timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    txHash: '0x789...012',
    completedAt: Math.floor(Date.now() / 1000) - 1800, // 30 minutes after start
  },
];

// Get transaction status badge
const getStatusBadge = (status: string) => {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">Pending</Badge>;
    case 'completed':
      return <Badge variant="secondary" className="bg-green-500/20 text-green-500">Completed</Badge>;
    case 'failed':
      return <Badge variant="secondary" className="bg-red-500/20 text-red-500">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Import types from shared types file
import type { Token, Chain } from '@/types';

// Extend the Token type to make logoURI required
interface TokenWithLogo extends Omit<Token, 'logoURI'> {
  logoURI: string;
}

// Extend the Chain type to include required properties
interface ChainExtended extends Chain {
  rpcUrl: string;
  explorerUrl: string;
  icon: string;
  isL1?: boolean;
}

// Mock tokens for now - replace with actual token list
const MOCK_TOKENS: TokenWithLogo[] = [
  {
    address: zeroAddress,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chainId: 1,
    logoURI: '/tokens/eth.png',
  },
  // Add more tokens as needed
];

// Mock chains for now - replace with actual chain list
const MOCK_CHAINS: ChainExtended[] = [
  { 
    id: 1, 
    name: 'Ethereum', 
    isL1: true,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR-INFURA-KEY',
    explorerUrl: 'https://etherscan.io',
    icon: '/chains/ethereum.png',
  },
  { 
    id: 10, 
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    icon: '/chains/optimism.png',
  },
  // Add more chains as needed
];

export function BridgeForm() {
  const [showRecipient, setShowRecipient] = useState(false);
  const [showSlippage, setShowSlippage] = useState(false);
  const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [fromToken, setFromToken] = useState<TokenWithLogo | null>(null);
  const [toToken, setToToken] = useState<TokenWithLogo | null>(null);
  const [fromChain, setFromChain] = useState<ChainExtended | null>(null);
  const [toChain, setToChain] = useState<ChainExtended | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  
  // Get wallet connection status
  const { address, isConnected } = useAccount();
  
  // Set default chains if not set
  useEffect(() => {
    if (MOCK_CHAINS.length >= 2 && !fromChain && !toChain) {
      setFromChain(MOCK_CHAINS[0]);
      setToChain(MOCK_CHAINS[1]);
    }
  }, [fromChain, toChain]);
  
  // Set default tokens if not set
  useEffect(() => {
    if (MOCK_TOKENS.length > 0 && fromChain && !fromToken) {
      const defaultToken = MOCK_TOKENS.find(t => t.chainId === fromChain.id) || MOCK_TOKENS[0];
      setFromToken(defaultToken);
    }
  }, [fromChain, fromToken]);
  
  // Get token balance
  const { data: tokenBalance } = useBalance({
    address: address,
    token: fromToken?.address !== zeroAddress ? fromToken?.address as `0x${string}` : undefined,
    chainId: fromChain?.id,
    // enabled: !!fromToken && !!fromChain && isConnected, // Removed as it's not in the type definition
  });
  
  // Format balance for display
  const formattedBalance = useMemo(() => {
    if (!tokenBalance) return '0.0';
    return parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)).toFixed(4);
  }, [tokenBalance]);
    
  // Handle amount change with validation
  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };
  
  // Handle max amount
  const handleMaxAmount = () => {
    if (tokenBalance) {
      // For native token, leave some for gas
      const balance = fromToken?.address === zeroAddress
        ? tokenBalance.value * BigInt(99) / BigInt(100) // Leave 1% for gas
        : tokenBalance.value;
      
      setAmount(formatUnits(balance, tokenBalance.decimals));
    }
  };
  
  const {
    // State
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
    recipient,
    slippage,
    isBridging,
    tokenBalance,
    needsApproval,
    quote,
    isLoadingQuote,
    quoteError,
    isValid,
    
    // Handlers
    handleFromChainChange,
    handleToChainChange,
    handleFromTokenChange,
    handleToTokenChange,
    handleAmountChange,
    handleRecipientChange,
    handleSlippageChange,
    handleSwapChains,
    handleMaxClick,
    handleSubmit,
    
    // Validation
    validateRecipient,
    validateAmount,
    
    // Data
    chains,
    fromTokens,
    toTokens,
  } = useBridgeForm();
  
  // Validate form fields
  const recipientError = useMemo(() => {
    if (!showRecipient) return null;
    return validateRecipient(recipient || '');
  }, [showRecipient, recipient, validateRecipient]);
  
  const amountError = useMemo(() => {
    return validateAmount(amount);
  }, [amount, validateAmount]);
  
  // Format token balance for display
  const formattedBalance = useMemo(() => {
    if (!tokenBalance) return '0';
    const balance = parseFloat(tokenBalance);
    return formatCurrency(balance, 6);
  }, [tokenBalance]);
  
  // Mock bridge quote data for now
  const isLoadingQuote = false;
  const quoteError = null;
  const quoteData = null;
  const allQuotes: any[] = [];
  const selectedQuote = null;
  const canBridge = false;
  const isBridging = false;
  
  // Mock bridge function
  const bridge = async () => {
    // Implement actual bridge logic here
    console.log('Bridging...');
  };
  
  // Mock providers data
  const providers = useMemo(() => {
    return [
      {
        id: 'socket',
        name: 'Socket',
        logo: '/providers/socket.png',
        estimatedTime: 300, // 5 minutes
        fee: '0.001',
        rate: '1.0',
        amountOut: amount, // Same as input for now
        steps: [
          { type: 'swap', from: fromToken, to: toToken },
          { type: 'bridge', from: fromChain, to: toChain },
        ],
      },
      // Add more providers as needed
    ];
  }, [amount, fromToken, toToken, fromChain, toChain]);
  
  // Mock fiat value
  const fiatValue = useMemo(() => {
    if (!amount) return '';
    // Mock price of ETH at $2000
    const price = 2000;
    const value = parseFloat(amount) * price;
    return `$${value.toFixed(2)}`;
  }, [amount]);
  
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBridge) return;
    
    try {
      await bridge();
      // Handle success (e.g., show success message, reset form, etc.)
    } catch (error) {
      console.error('Bridge error:', error);
      // Handle error (e.g., show error message)
    }
  }, [canBridge]);
  
  // Get bridge quotes
  const {
    data: bestQuote,
    allQuotes,
    isLoading: isLoadingQuote,
    isError: isQuoteError,
    error: quoteError,
    refetch: refetchQuote,
  } = useBridgeQuote({
    fromChain: fromChain?.id,
    toChain: toChain?.id,
    fromToken,
    toToken,
    amount,
    slippage,
    enabled: !!fromChain && !!toChain && !!fromToken && !!toToken && !!amount && parseFloat(amount) > 0,
  });

  // Update selected provider when best quote changes
  useEffect(() => {
    if (bestQuote && !selectedProvider) {
      setSelectedProvider(bestQuote.provider);
    }
  }, [bestQuote, selectedProvider]);

  // Get the selected quote
  const selectedQuote = useMemo(() => {
    return allQuotes.find(q => q.provider === selectedProvider) || bestQuote;
  }, [allQuotes, bestQuote, selectedProvider]);

  // Format quote information
  const formattedQuote = useMemo(() => {
    if (!selectedQuote) return null;
    
    return {
      amountOut: formatCurrency(parseFloat(selectedQuote.amountOut), 6),
      fee: formatCurrency(parseFloat(selectedQuote.fee), 6),
      minAmountOut: formatCurrency(parseFloat(selectedQuote.minAmountOut), 6),
      estimatedTime: `${Math.ceil(selectedQuote.estimatedTime / 60)} min`,
    };
  }, [selectedQuote]);
  
  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };
  
  return (
    <div className="w-full max-w-lg mx-auto bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Bridge Tokens
          </h2>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
                  onClick={() => setShowSlippage(!showSlippage)}
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Transaction settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Slippage Settings Popover */}
        <Popover open={showSlippage} onOpenChange={setShowSlippage}>
          <PopoverContent className="w-80 p-4" align="end" sideOffset={10}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Transaction Settings</h4>
                <button 
                  onClick={() => setShowSlippage(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slippage" className="text-sm font-medium">
                    Slippage Tolerance
                  </Label>
                  <span className="text-sm text-muted-foreground">{slippage}%</span>
                </div>
                <div className="flex space-x-2">
                  {[0.1, 0.5, 1].map((value) => (
                    <Button
                      key={value}
                      variant={slippage === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSlippage(value)}
                      className="flex-1"
                    >
                      {value}%
                    </Button>
                  ))}
                  <div className="relative flex-1">
                    <Input
                      id="slippage"
                      type="number"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={slippage}
                      onChange={(e) => setSlippage(Number(e.target.value))}
                      className="h-9 text-right pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <form onSubmit={onSubmit} className="space-y-6">
          {/* From Chain & Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="from-amount" className="text-sm font-medium text-muted-foreground">
                From
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  Balance: {formattedBalance}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                  onClick={handleMaxAmount}
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="relative flex items-center space-x-2 bg-muted/50 rounded-xl p-3">
              <div className="flex-1">
                <Input
                  id="from-amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  autoCorrect="off"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="h-12 text-2xl border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  ${/* TODO: Add fiat value */}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <TokenSelector
                  selectedToken={fromToken}
                  onSelect={setFromToken}
                  chainId={fromChain?.id}
                  className="w-[140px]"
                />
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground mr-1">on</span>
                  <ChainSelector
                    selectedChain={fromChain}
                    onSelect={setFromChain}
                    className="h-4"
                    triggerClassName="text-xs text-muted-foreground hover:text-foreground"
                    showName={false}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Swap Chains Button */}
          <div className="flex justify-center -my-2">
            <button
              type="button"
              onClick={handleSwapChains}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              disabled={isBridging}
              aria-label="Swap chains"
            >
              <ArrowUpDown className="h-5 w-5" />
            </button>
          </div>
          
          {/* To Chain & Token */}
          <div className="space-y-2">
            <Label htmlFor="to-chain">To</Label>
            <div className="flex space-x-2">
              <div className="w-1/3">
                <ChainSelector
                  selectedChain={toChain}
                  chains={chains.filter(chain => chain.id !== fromChain?.id)}
                  onChainSelect={handleToChainChange}
                  disabled={isBridging}
                />
              </div>
              <div className="flex-1">
                <TokenSelector
                  selectedToken={toToken}
                  tokens={toTokens}
                  onTokenSelect={handleToTokenChange}
                  disabled={isBridging}
                />
              </div>
            </div>
          </div>
          
          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              {amountError && (
                <span className="text-sm text-destructive">{amountError}</span>
              )}
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={cn(
                  'text-2xl py-6 pl-4 pr-24',
                  amountError && 'border-destructive'
                )}
                disabled={isBridging || !fromToken}
              />
              {fromToken && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {fromToken.symbol}
                </div>
              )}
            </div>
          </div>
          
          {/* Bridge Provider Selection */}
          {fromChain && toChain && fromToken && toToken && amount && parseFloat(amount) > 0 && (
            <BridgeProviderSelector
              fromChain={fromChain.id}
              toChain={toChain.id}
              fromToken={fromToken}
              toToken={toToken}
              amount={amount}
              slippage={slippage}
              selectedProvider={selectedProvider}
              onSelectProvider={setSelectedProvider}
            />
          )}
          
          {/* Quote Information */}
          {selectedQuote && !isLoadingQuote && !isQuoteError && (
            <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-medium">
                  {formattedQuote?.amountOut} {toToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bridge fee</span>
                <span>{formattedQuote?.fee} {selectedQuote.feeToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum received</span>
                <span>{formattedQuote?.minAmountOut} {toToken?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated time</span>
                <span>{formattedQuote?.estimatedTime}</span>
              </div>
              
              {selectedQuote.route && selectedQuote.route.length > 0 && (
                <div className="pt-2 mt-2 border-t border-muted">
                  <div className="text-muted-foreground text-xs mb-1">Route:</div>
                  <div className="flex items-center flex-wrap gap-1 text-xs">
                    {selectedQuote.route.map((step, i) => (
                      <div key={i} className="flex items-center">
                        {i > 0 && (
                          <ChevronDown className="h-3 w-3 mx-1 text-muted-foreground" />
                        )}
                        <div className="bg-muted/50 px-2 py-1 rounded flex items-center">
                          {step.name}
                          {i === 0 && selectedQuote.providerLogo && (
                            <img 
                              src={selectedQuote.providerLogo} 
                              alt={selectedQuote.provider}
                              className="h-3 w-3 rounded-full ml-1"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isLoadingQuote && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Fetching quote...</span>
            </div>
          )}
          
          {isQuoteError && (
            <div className="flex items-center p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Failed to fetch quote</p>
                <p className="text-xs">
                  {quoteError?.message || 'Please try again or select different tokens'}
                </p>
                <button 
                  onClick={() => refetchQuote()}
                  className="mt-1 text-xs underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {/* Recipient Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-recipient"
                checked={showRecipient}
                onCheckedChange={setShowRecipient}
                disabled={isBridging}
              />
              <Label htmlFor="show-recipient" className="text-sm">
                Send to different address
              </Label>
            </div>
            
            <button
              type="button"
              onClick={() => setShowSlippage(!showSlippage)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isBridging}
            >
              Slippage: {slippage}%
            </button>
          </div>
          
          {/* Recipient Input */}
          {showRecipient && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="recipient">Recipient Address</Label>
                {recipientError && (
                  <span className="text-sm text-destructive">{recipientError}</span>
                )}
              </div>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipient || ''}
                onChange={(e) => handleRecipientChange(e.target.value)}
                className={cn(recipientError && 'border-destructive')}
                disabled={isBridging}
              />
            </div>
          )}
          
          {/* Slippage Settings */}
          {showSlippage && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="slippage">Slippage Tolerance</Label>
                <div className="relative w-24">
                  <Input
                    id="slippage"
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={slippage}
                    onChange={(e) => handleSlippageChange(parseFloat(e.target.value) || 0.5)}
                    className="pr-8 text-right"
                    disabled={isBridging}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                The maximum difference between your expected price and the actual price.
              </p>
            </div>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold"
            disabled={!isValid || isBridging || isLoadingQuote}
          >
            {isBridging ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Bridging...
              </>
            ) : needsApproval ? (
              <>
                <span>Approve {fromToken?.symbol}</span>
                <span className="ml-2 text-xs opacity-80">(One-time per token)</span>
              </>
            ) : (
              <div className="flex items-center justify-center w-full">
                <span>Bridge {fromToken?.symbol} to {toToken?.symbol}</span>
                {selectedQuote?.providerLogo && (
                  <img 
                    src={selectedQuote.providerLogo} 
                    alt={selectedQuote.provider}
                    className="h-4 w-4 rounded-full ml-2"
                  />
                )}
              </div>
            )}  
          </Button>
        </form>
      </div>
    </div>
  );
