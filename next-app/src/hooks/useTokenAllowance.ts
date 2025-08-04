import { useQuery } from '@tanstack/react-query';
import { Token } from '@/types';
import { Address, formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

// ERC20 ABI for allowance
const ERC20_ABI = [
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    type: "function",
  },
] as const;

interface UseTokenAllowanceProps {
  token: Token | null;
  owner: Address | undefined;
  spender: Address;
  chainId?: number;
  enabled?: boolean;
}

export function useTokenAllowance({
  token,
  owner,
  spender,
  chainId,
  enabled = true,
}: UseTokenAllowanceProps) {
  const publicClient = usePublicClient({ chainId });
  const { address: connectedAddress } = useAccount();
  
  const account = owner || connectedAddress;
  const isNativeToken = token?.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  return useQuery({
    queryKey: ['tokenAllowance', token?.address, account, spender, chainId],
    queryFn: async () => {
      if (!token || !account || !publicClient || isNativeToken) {
        return '0';
      }

      try {
        const allowance = await publicClient.readContract({
          address: token.address as Address,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [account, spender],
        });

        return formatUnits(allowance, token.decimals);
      } catch (error) {
        console.error('Error fetching token allowance:', error);
        return '0';
      }
    },
    enabled: !!token && !!account && !!publicClient && !isNativeToken && enabled,
    refetchInterval: 30000, // 30 seconds
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
