import { useQuery } from '@tanstack/react-query';
import { Token } from '@/types';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';

// Common token addresses
const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

// Mock token data - in a real app, this would come from an API or token lists
const DEFAULT_TOKENS: Record<number, Token[]> = {
  1: [
    {
      address: ETH_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 1,
      logoURI: '/tokens/eth.png',
    },
    {
      address: WETH_ADDRESS,
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      decimals: 18,
      chainId: 1,
      logoURI: '/tokens/weth.png',
    },
    {
      address: USDC_ADDRESS,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1,
      logoURI: '/tokens/usdc.png',
    },
    {
      address: USDT_ADDRESS,
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 1,
      logoURI: '/tokens/usdt.png',
    },
    {
      address: DAI_ADDRESS,
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 1,
      logoURI: '/tokens/dai.png',
    },
  ],
  42161: [
    {
      address: ETH_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 42161,
      logoURI: '/tokens/eth.png',
    },
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      decimals: 18,
      chainId: 42161,
      logoURI: '/tokens/weth.png',
    },
    {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC on Arbitrum
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 42161,
      logoURI: '/tokens/usdc.png',
    },
  ],
  // Add more chains as needed
};

// Mock token balances - in a real app, this would come from an API or blockchain RPC
const MOCK_BALANCES: Record<string, string> = {
  [ETH_ADDRESS]: '1.5', // 1.5 ETH
  [WETH_ADDRESS]: '0.75', // 0.75 WETH
  [USDC_ADDRESS]: '1000', // 1000 USDC
  [USDT_ADDRESS]: '500', // 500 USDT
  [DAI_ADDRESS]: '250', // 250 DAI
};

// Mock token prices - in a real app, this would come from an API
const MOCK_PRICES: Record<string, string> = {
  [ETH_ADDRESS]: '2000', // $2000 per ETH
  [WETH_ADDRESS]: '2000', // $2000 per WETH
  [USDC_ADDRESS]: '1', // $1 per USDC
  [USDT_ADDRESS]: '1', // $1 per USDT
  [DAI_ADDRESS]: '1', // $1 per DAI
};

export function useTokens(chainId?: number) {
  const { address } = useAccount();

  return useQuery<Token[], Error>({
    queryKey: ['tokens', chainId, address],
    queryFn: async () => {
      if (!chainId) return [];
      
      // In a real app, you would fetch tokens from an API or token list
      const chainTokens = DEFAULT_TOKENS[chainId as keyof typeof DEFAULT_TOKENS] || [];
      
      // Add mock balances and prices
      const tokensWithBalances = chainTokens.map(token => {
        const balance = MOCK_BALANCES[token.address] || '0';
        const price = MOCK_PRICES[token.address] || '0';
        
        return {
          ...token,
          balance,
          priceUSD: price,
        };
      });
      
      return tokensWithBalances;
    },
    enabled: !!chainId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
