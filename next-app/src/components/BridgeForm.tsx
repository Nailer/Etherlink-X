'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { TokenSelector } from './TokenSelector';
import { ChainSelector } from './ChainSelector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTokenAllowance } from '@/hooks/useTokenAllowance';
import { useBridgeQuote } from '@/hooks/useBridgeQuote';
import { useDebounce } from '@/hooks/useDebounce';

export function BridgeForm() {
  const { address } = useAccount();
  const {
    state: {
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount,
      recipient,
      isBridging,
      error,
    },
    dispatch,
    switchChains,
    executeBridge,
  } = useAppContext();

  const debouncedAmount = useDebounce(amount, 500);
  const [useRecipient, setUseRecipient] = useState(false);
  
  // Fetch token balance
  const { data: tokenBalance } = useTokenBalance({
    token: fromToken,
    address: address as `0x${string}`,
    chainId: fromChain,
    enabled: !!fromToken && !!address,
  });

  // Fetch token allowance if needed
  const { data: allowance } = useTokenAllowance({
    token: fromToken,
    owner: address as `0x${string}`,
    spender: '0x0000000000000000000000000000000000000000', // Replace with actual bridge address
    chainId: fromChain,
    enabled: !!fromToken && !!address && amount !== '0' && amount !== '',
  });

  // Fetch bridge quote
  const {
    data: quote,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useBridgeQuote({
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount: debouncedAmount,
    recipient: useRecipient ? recipient : address,
    enabled: 
      !!fromToken && 
      !!toToken && 
      !!debouncedAmount && 
      parseFloat(debouncedAmount) > 0 &&
      (useRecipient ? !!recipient : true),
  });

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      dispatch({ type: 'SET_AMOUNT', amount: value });
    }
  };

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    if (!tokenBalance || !fromToken) return;
    
    // Leave a small amount for gas
    const balance = parseFloat(tokenBalance);
    const gasBuffer = 0.001; // Adjust based on token decimals
    const maxAmount = Math.max(0, balance - gasBuffer);
    
    if (maxAmount > 0) {
      dispatch({ 
        type: 'SET_AMOUNT', 
        amount: maxAmount.toString() 
      });
    }
  }, [tokenBalance, fromToken]);

  // Handle recipient change
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_RECIPIENT', address: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBridging || !quote) return;
    
    try {
      await executeBridge();
    } catch (error) {
      console.error('Bridge submission error:', error);
    }
  };

  // Update error state when quote fails
  useEffect(() => {
    if (quoteError) {
      dispatch({ 
        type: 'SET_ERROR', 
        error: quoteError.message || 'Failed to get bridge quote' 
      });
    }
  }, [quoteError, dispatch]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Bridge Tokens
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* From Chain & Token */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="from-chain">From</Label>
              {tokenBalance !== undefined && (
                <div className="text-sm text-gray-500">
                  Balance: {tokenBalance} {fromToken?.symbol}
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="ml-1 text-primary hover:text-primary/80 font-medium"
                  >
                    Max
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <ChainSelector
                selectedChainId={fromChain}
                onSelectChain={(chainId) => 
                  dispatch({ type: 'SET_FROM_CHAIN', chainId })
                }
                excludeChainId={toChain}
                className="flex-1"
              />
              
              <TokenSelector
                selectedToken={fromToken}
                onSelectToken={(token) => 
                  dispatch({ type: 'SET_FROM_TOKEN', token })
                }
                chainId={fromChain}
                className="flex-1"
              />
            </div>
            
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={handleAmountChange}
                className="text-2xl font-medium py-6 px-4"
                disabled={!fromToken}
              />
              {fromToken && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-sm text-gray-500">
                    {fromToken.symbol}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Switch Chains Button */}
          <div className="flex justify-center -my-2">
            <button
              type="button"
              onClick={switchChains}
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Switch chains"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          
          {/* To Chain & Token */}
          <div className="space-y-2">
            <Label htmlFor="to-chain">To</Label>
            <div className="flex space-x-2">
              <ChainSelector
                selectedChainId={toChain}
                onSelectChain={(chainId) => 
                  dispatch({ type: 'SET_TO_CHAIN', chainId })
                }
                excludeChainId={fromChain}
                className="flex-1"
              />
              
              <TokenSelector
                selectedToken={toToken}
                onSelectToken={(token) => 
                  dispatch({ type: 'SET_TO_TOKEN', token })
                }
                chainId={toChain}
                className="flex-1"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
              {isQuoteLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                  <span>Fetching best route...</span>
                </div>
              ) : quote ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>You will receive:</span>
                    <span className="font-medium text-gray-900">
                      {quote.amountOut} {toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange rate:</span>
                    <span className="font-medium">
                      1 {fromToken?.symbol} = {quote.exchangeRate} {toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated time:</span>
                    <span className="font-medium">
                      {Math.ceil(quote.estimatedTime / 60)} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <span className="font-medium">
                      {quote.fee} {quote.feeToken.symbol}
                    </span>
                  </div>
                </div>
              ) : (
                <div>Enter an amount to see bridge details</div>
              )}
            </div>
          </div>
          
          {/* Recipient Address */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-recipient"
                  checked={useRecipient}
                  onCheckedChange={setUseRecipient}
                />
                <Label htmlFor="use-recipient">Send to different address</Label>
              </div>
            </div>
            
            {useRecipient && (
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={handleRecipientChange}
                  className="font-mono"
                />
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-6 text-base font-medium"
            disabled={
              !fromToken || 
              !toToken || 
              !amount || 
              parseFloat(amount) <= 0 ||
              isBridging ||
              !quote ||
              (useRecipient && !recipient)
            }
            isLoading={isBridging}
          >
            {!address ? 'Connect Wallet' : 'Bridge Now'}
          </Button>
        </form>
      </div>
    </div>
  );
}
