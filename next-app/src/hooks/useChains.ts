import { useQuery } from '@tanstack/react-query';
import { Chain } from '@/types';

// Mock data for chains - in a real app, this would come from an API or configuration
const DEFAULT_CHAINS: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    icon: '/chains/ethereum.svg',
    isL1: true,
  },
  {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    icon: '/chains/arbitrum.svg',
    isL1: false,
  },
  {
    id: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    icon: '/chains/optimism.svg',
    isL1: false,
  },
  {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    icon: '/chains/polygon.svg',
    isL1: false,
  },
  {
    id: 56,
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    icon: '/chains/bsc.svg',
    isL1: false,
  },
];

export function useChains() {
  return useQuery<Chain[], Error>({
    queryKey: ['chains'],
    queryFn: async () => {
      // In a real app, you might fetch this from an API
      return DEFAULT_CHAINS;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
