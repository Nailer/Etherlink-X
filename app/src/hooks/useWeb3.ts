import { useCallback, useEffect, useState } from 'react';
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import type { Address } from 'viem';
import { formatEther, parseEther } from 'viem';
import type { TokenSymbol } from '@/config/web3';
import { CHAIN_IDS, TOKEN_ADDRESSES, TOKEN_METADATA } from '@/config/web3';

type TokenBalance = {
  symbol: TokenSymbol;
  balance: string;
  decimals: number;
  formatted: string;
};

export function useWeb3() {
  // Hooks from wagmi
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  
  // Local state
  const [isMounted, setIsMounted] = useState(false);
  const [balances, setBalances] = useState<Record<string, TokenBalance>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Format token balance
  const formatTokenBalance = useCallback((balance: bigint, decimals: number): string => {
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = balance / divisor;
    const fraction = (balance % divisor).toString().padStart(decimals, '0').replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole.toString();
  }, []);

  // Get native token balance
  const getNativeBalance = useCallback(async (): Promise<TokenBalance> => {
    if (!address || !currentChainId) throw new Error('No address or chain ID');
    
    // In a real app, you would fetch this from a provider
    // For demo purposes, we'll return a mock balance
    const mockBalance = parseEther('1.5'); // 1.5 ETH or native token
    
    return {
      symbol: currentChainId === CHAIN_IDS.AVALANCHE_FUJI ? 'AVAX' : 'ETH' as TokenSymbol,
      balance: mockBalance.toString(),
      decimals: 18,
      formatted: formatTokenBalance(mockBalance, 18),
    };
  }, [address, currentChainId, formatTokenBalance]);

  // Get token balance
  const getTokenBalance = useCallback(async (tokenSymbol: TokenSymbol): Promise<TokenBalance> => {
    if (!address || !currentChainId) throw new Error('No address or chain ID');
    
    const tokenInfo = TOKEN_METADATA[tokenSymbol];
    const tokenAddress = TOKEN_ADDRESSES[currentChainId]?.[tokenSymbol];
    
    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not supported on this chain`);
    }
    
    // In a real app, you would fetch this from a token contract
    // For demo purposes, we'll return a mock balance
    const mockBalance = parseEther('1000'); // 1000 tokens
    
    return {
      symbol: tokenSymbol,
      balance: mockBalance.toString(),
      decimals: tokenInfo.decimals,
      formatted: formatTokenBalance(mockBalance, tokenInfo.decimals),
    };
  }, [address, currentChainId, formatTokenBalance]);

  // Load all balances
  const loadBalances = useCallback(async () => {
    if (!isConnected || !address || !currentChainId) return;
    
    setIsLoadingBalances(true);
    setError(null);
    
    try {
      const nativeBalance = await getNativeBalance();
      const tokenSymbols = Object.keys(TOKEN_METADATA) as TokenSymbol[];
      const tokenBalances = await Promise.all(
        tokenSymbols.map(symbol => 
          getTokenBalance(symbol).catch(() => null)
        )
      );
      
      const allBalances: Record<string, TokenBalance> = {
        [nativeBalance.symbol]: nativeBalance,
      };
      
      tokenBalances.forEach(balance => {
        if (balance) {
          allBalances[balance.symbol] = balance;
        }
      });
      
      setBalances(allBalances);
    } catch (err) {
      console.error('Error loading balances:', err);
      setError(err instanceof Error ? err : new Error('Failed to load balances'));
    } finally {
      setIsLoadingBalances(false);
    }
  }, [isConnected, address, currentChainId, getNativeBalance, getTokenBalance]);

  // Switch network
  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      await switchChain({ chainId });
      return true;
    } catch (err) {
      console.error('Error switching network:', err);
      return false;
    }
  }, [switchChain]);

  // Format address
  const formatAddress = useCallback((addr: string | undefined): string => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }, []);

  // Format balance
  const formatBalance = useCallback((balance: string, decimals: number, maxDecimals = 6): string => {
    try {
      const [whole, fraction] = balance.split('.');
      if (!fraction) return whole;
      
      const trimmedFraction = fraction.length > maxDecimals 
        ? fraction.substring(0, maxDecimals) 
        : fraction;
      
      return `${whole}.${trimmedFraction}`;
    } catch (err) {
      console.error('Error formatting balance:', err);
      return '0';
    }
  }, []);

  // Auto-load balances when connected or chain changes
  useEffect(() => {
    if (isConnected && address && currentChainId) {
      loadBalances();
    } else {
      setBalances({});
    }
  }, [isConnected, address, currentChainId, loadBalances]);

  return {
    // Connection
    address,
    isConnected: isMounted && isConnected,
    chainId: currentChainId,
    isConnecting: isPending,
    connect,
    disconnect,
    connectors,
    
    // Network
    switchNetwork,
    
    // Balances
    balances,
    isLoadingBalances,
    error,
    loadBalances,
    getNativeBalance,
    getTokenBalance,
    
    // Utils
    formatAddress,
    formatBalance,
  };
}

export default useWeb3;
