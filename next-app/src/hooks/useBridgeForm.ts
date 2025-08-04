import { useCallback, useEffect, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useAppContext } from '@/contexts/app-context';
import { useChains } from './useChains';
import { useTokens } from './useTokens';
import { useTokenBalance } from './useTokenBalance';
import { useTokenAllowance } from './useTokenAllowance';
import { useBridgeQuote } from './useBridgeQuote';
import { formatUnits, parseUnits, isAddress, zeroAddress } from 'viem';
import { useToast } from '@/components/ui/use-toast';

export function useBridgeForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  
  // App context
  const { state, dispatch } = useAppContext();
  const {
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
    recipient,
    slippage,
    isBridging,
  } = state;

  // Data hooks
  const { data: chains = [] } = useChains();
  const { data: fromTokens = [] } = useTokens(fromChain?.id);
  const { data: toTokens = [] } = useTokens(toChain?.id);
  
  // Token balance and allowance
  const { data: tokenBalance = '0' } = useTokenBalance({
    token: fromToken,
    address: address as `0x${string}`,
    chainId: fromChain?.id,
    enabled: !!fromToken && !!address && !!fromChain,
  });

  const { data: allowance = '0' } = useTokenAllowance({
    token: fromToken,
    owner: address as `0x${string}`,
    spender: process.env.NEXT_PUBLIC_ROUTER_ADDRESS as `0x${string}`,
    chainId: fromChain?.id,
    enabled: !!fromToken && 
             !!address && 
             !!fromChain && 
             fromToken.address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Not needed for native tokens
  });

  // Bridge quote
  const {
    data: quote,
    isLoading: isLoadingQuote,
    error: quoteError,
    refetch: refetchQuote,
  } = useBridgeQuote({
    fromChain: fromChain?.id,
    toChain: toChain?.id,
    fromToken,
    toToken,
    amount,
    recipient: recipient || address,
    slippage,
    enabled: !!fromChain && 
             !!toChain && 
             !!fromToken && 
             !!toToken && 
             !!amount && 
             parseFloat(amount) > 0 &&
             (!!recipient || !!address),
  });

  // Set default chains if not set
  useEffect(() => {
    if (chains.length > 0 && (!fromChain || !toChain)) {
      const defaultFromChain = chains.find(chain => chain.isL1) || chains[0];
      const defaultToChain = chains.find(chain => !chain.isL1 && chain.id !== defaultFromChain?.id) || chains[1] || chains[0];
      
      if (!fromChain && defaultFromChain) {
        dispatch({ type: 'SET_FROM_CHAIN', payload: defaultFromChain });
      }
      
      if (!toChain && defaultToChain) {
        dispatch({ type: 'SET_TO_CHAIN', payload: defaultToChain });
      }
    }
  }, [chains, fromChain, toChain, dispatch]);

  // Set default tokens when chain changes
  useEffect(() => {
    if (fromChain && fromTokens.length > 0 && !fromToken) {
      const defaultToken = fromTokens.find(t => t.symbol === 'ETH') || fromTokens[0];
      if (defaultToken) {
        dispatch({ type: 'SET_FROM_TOKEN', payload: defaultToken });
      }
    }
  }, [fromChain, fromTokens, fromToken, dispatch]);

  useEffect(() => {
    if (toChain && toTokens.length > 0 && !toToken) {
      // Try to find a token with the same symbol as the from token
      const matchingToken = toTokens.find(t => 
        fromToken && t.symbol === fromToken.symbol
      );
      
      const defaultToken = matchingToken || toTokens.find(t => t.symbol === 'ETH') || toTokens[0];
      
      if (defaultToken) {
        dispatch({ type: 'SET_TO_TOKEN', payload: defaultToken });
      }
    }
  }, [toChain, toTokens, toToken, fromToken, dispatch]);

  // Handle chain changes
  const handleFromChainChange = useCallback((chain: typeof fromChain) => {
    dispatch({ type: 'SET_FROM_CHAIN', payload: chain });
    // Reset from token when chain changes
    dispatch({ type: 'SET_FROM_TOKEN', payload: null });
    // Reset amount when chain changes
    dispatch({ type: 'SET_AMOUNT', payload: '' });
  }, [dispatch]);

  const handleToChainChange = useCallback((chain: typeof toChain) => {
    dispatch({ type: 'SET_TO_CHAIN', payload: chain });
    // Reset to token when chain changes
    dispatch({ type: 'SET_TO_TOKEN', payload: null });
  }, [dispatch]);

  // Handle token changes
  const handleFromTokenChange = useCallback((token: typeof fromToken) => {
    dispatch({ type: 'SET_FROM_TOKEN', payload: token });
    // Reset amount when token changes
    dispatch({ type: 'SET_AMOUNT', payload: '' });
  }, [dispatch]);

  const handleToTokenChange = useCallback((token: typeof toToken) => {
    dispatch({ type: 'SET_TO_TOKEN', payload: token });
  }, [dispatch]);

  // Handle amount change with validation
  const handleAmountChange = useCallback((value: string) => {
    // Allow empty string or valid decimal number
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      dispatch({ type: 'SET_AMOUNT', payload: value });
    }
  }, [dispatch]);

  // Handle recipient change with validation
  const handleRecipientChange = useCallback((value: string) => {
    dispatch({ type: 'SET_RECIPIENT', payload: value });
  }, [dispatch]);

  // Handle slippage change with validation
  const handleSlippageChange = useCallback((value: number) => {
    if (value >= 0 && value <= 50) { // Max 50% slippage
      dispatch({ type: 'SET_SLIPPAGE', payload: value });
    }
  }, [dispatch]);

  // Check if the form is valid
  const isValid = useMemo(() => {
    return (
      !!fromChain &&
      !!toChain &&
      !!fromToken &&
      !!toToken &&
      !!amount &&
      parseFloat(amount) > 0 &&
      parseFloat(amount) <= parseFloat(tokenBalance || '0') &&
      (!!recipient || !!address) &&
      (!recipient || isAddress(recipient))
    );
  }, [fromChain, toChain, fromToken, toToken, amount, tokenBalance, recipient, address]);

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (!fromToken || !amount) return false;
    
    // Native tokens don't need approval
    if (fromToken.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      return false;
    }
    
    const amountWei = parseUnits(amount, fromToken.decimals);
    const allowanceWei = parseUnits(allowance || '0', fromToken.decimals);
    
    return amountWei > allowanceWei;
  }, [fromToken, amount, allowance]);

  // Handle swap chains
  const handleSwapChains = useCallback(() => {
    dispatch({ type: 'SWAP_CHAINS' });
    // Reset amount when swapping chains
    dispatch({ type: 'SET_AMOUNT', payload: '' });
  }, [dispatch]);

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    if (!fromToken) return;
    
    // For native tokens, leave some for gas
    if (fromToken.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      const balance = parseFloat(tokenBalance);
      const gasBuffer = 0.001; // 0.001 ETH buffer for gas
      const maxAmount = Math.max(0, balance - gasBuffer);
      
      if (maxAmount > 0) {
        dispatch({ type: 'SET_AMOUNT', payload: maxAmount.toString() });
      } else {
        dispatch({ type: 'SET_AMOUNT', payload: '0' });
      }
    } else {
      // For ERC20 tokens, use full balance
      dispatch({ type: 'SET_AMOUNT', payload: tokenBalance });
    }
  }, [fromToken, tokenBalance, dispatch]);

  // Handle recipient address validation
  const validateRecipient = useCallback((value: string): string | null => {
    if (!value) return null; // Empty is valid (will use connected address)
    if (!isAddress(value)) return 'Invalid address';
    return null;
  }, []);

  // Handle amount validation
  const validateAmount = useCallback((value: string): string | null => {
    if (!value) return 'Amount is required';
    
    const amountNum = parseFloat(value);
    if (isNaN(amountNum) || amountNum <= 0) return 'Amount must be greater than 0';
    
    if (tokenBalance && amountNum > parseFloat(tokenBalance)) {
      return 'Insufficient balance';
    }
    
    return null;
  }, [tokenBalance]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !fromChain || !toChain || !fromToken || !toToken || !amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    // Set bridging state
    dispatch({ type: 'SET_IS_BRIDGING', payload: true });
    
    try {
      // In a real app, you would call the bridge function here
      // For now, we'll just simulate a successful bridge
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add transaction to history
      const tx = {
        id: `tx-${Date.now()}`,
        fromChain: fromChain.id,
        toChain: toChain.id,
        fromToken,
        toToken,
        amount,
        recipient: recipient || address || '',
        status: 'pending' as const,
        timestamp: Math.floor(Date.now() / 1000),
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      };
      
      dispatch({ type: 'ADD_TRANSACTION', payload: tx });
      
      toast({
        title: 'Bridge initiated',
        description: 'Your bridge transaction has been submitted',
        variant: 'default',
      });
      
      // Reset form
      dispatch({ type: 'SET_AMOUNT', payload: '' });
    } catch (error) {
      console.error('Bridge error:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to submit bridge transaction',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_IS_BRIDGING', payload: false });
    }
  }, [isValid, fromChain, toChain, fromToken, toToken, amount, recipient, address, dispatch, toast]);

  return {
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
    allowance,
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
  };
}
