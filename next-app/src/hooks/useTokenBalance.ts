import { useQuery } from '@tanstack/react-query';
import { Token } from '@/types';
import { Address, formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

interface UseTokenBalanceProps {
  token: Token | null;
  address: Address | undefined;
  chainId?: number;
  enabled?: boolean;
}

export function useTokenBalance({
  token,
  address,
  chainId,
  enabled = true,
}: UseTokenBalanceProps) {
  const publicClient = usePublicClient({ chainId });
  const { address: connectedAddress } = useAccount();
  
  const account = address || connectedAddress;

  return useQuery({
    queryKey: ['tokenBalance', token?.address, account, chainId],
    queryFn: async () => {
      if (!token || !account || !publicClient) return '0';

      try {
        // For native token (ETH)
        if (token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
          const balance = await publicClient.getBalance({
            address: account as Address,
          });
          return formatUnits(balance, token.decimals);
        }

        // For ERC20 tokens
        const balance = await publicClient.readContract({
          address: token.address as Address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account],
        });

        return formatUnits(balance, token.decimals);
      } catch (error) {
        console.error('Error fetching token balance:', error);
        return '0';
      }
    },
    enabled: !!token && !!account && !!publicClient && enabled,
    refetchInterval: 30000, // 30 seconds
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
