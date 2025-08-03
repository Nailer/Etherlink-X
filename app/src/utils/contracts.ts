import { getContract, type Address, type PublicClient, type WalletClient, erc20Abi } from 'viem';
import { CrossChainRouterABI } from '@/contracts/CrossChainRouter';
import { APP_CONFIG } from '@/config/app';

// Contract addresses - these should be moved to environment variables in production
export const CONTRACT_ADDRESSES = {
  crossChainRouter: '0x1234...', // Replace with actual address
} as const;

// Re-export ABIs for easier imports in other files
export { CrossChainRouterABI } from '@/contracts/CrossChainRouter';

// Contract instances
export function getERC20Contract(tokenAddress: Address, publicClient?: PublicClient, walletClient?: WalletClient) {
  return getContract({
    address: tokenAddress,
    abi: erc20Abi,
    publicClient,
    walletClient,
  });
}

export function getCrossChainRouterContract(publicClient?: PublicClient, walletClient?: WalletClient) {
  return getContract({
    address: CONTRACT_ADDRESSES.crossChainRouter,
    abi: CrossChainRouterABI,
    publicClient,
    walletClient,
  });
}

// Token approval utilities
export async function approveToken(
  tokenAddress: Address,
  spender: Address,
  amount: bigint,
  walletClient: WalletClient
): Promise<`0x${string}`> {
  const account = walletClient.account?.address;
  if (!account) throw new Error('No account connected');
  
  const tokenContract = getERC20Contract(tokenAddress, undefined, walletClient);
  
  try {
    const hash = await tokenContract.write.approve([spender, amount], { account });
    return hash;
  } catch (error) {
    console.error('Error approving token:', error);
    throw new Error('Failed to approve token');
  }
}

// Format token amount with decimals
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = amount / divisor;
  const fractional = amount % divisor;
  
  if (fractional === 0n) {
    return whole.toString();
  }
  
  // Format fractional part with leading zeros
  const fractionalStr = fractional.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fractionalStr}`;
}

// Parse token amount from string with decimals
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole, fractional = '0'] = amount.split('.');
  const wholeBigInt = BigInt(whole) * (10n ** BigInt(decimals));
  const fractionalBigInt = BigInt((fractional + '0'.repeat(decimals)).slice(0, decimals));
  return wholeBigInt + fractionalBigInt;
}

// Get token balance
// Get token balance
export async function getTokenBalance(
  tokenAddress: Address, 
  userAddress: Address, 
  publicClient: PublicClient
): Promise<bigint> {
  try {
    if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      // Native token balance
      return await publicClient.getBalance({
        address: userAddress,
      });
    } else {
      // ERC20 token balance
      const tokenContract = getERC20Contract(tokenAddress, publicClient);
      return await tokenContract.read.balanceOf([userAddress]);
    }
  } catch (error) {
    console.error(`Error getting balance for token ${tokenAddress}:`, error);
    return 0n;
  }
}

// Get token allowance
export async function getTokenAllowance(
  tokenAddress: Address,
  owner: Address,
  spender: Address,
  publicClient: PublicClient
): Promise<bigint> {
  try {
    if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      // Native tokens don't need approval
      return BigInt(2) ** BigInt(256) - 1n; // Max uint256
    }
    
    const tokenContract = getERC20Contract(tokenAddress, publicClient);
    return await tokenContract.read.allowance([owner, spender]);
  } catch (error) {
    console.error(`Error getting allowance for token ${tokenAddress}:`, error);
    return 0n;
  }
}

// Format chain ID to name
export function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    11155111: 'Sepolia',
    10: 'Optimism',
    42161: 'Arbitrum',
    43113: 'Avalanche Fuji',
  };
  
  return chainNames[chainId] || `Chain ${chainId}`;
}

// Get block explorer URL
export function getExplorerUrl(chainId: number, type: 'tx' | 'address' | 'block', value: string): string {
  const baseUrl = APP_CONFIG.blockExplorers[chainId as keyof typeof APP_CONFIG.blockExplorers];
  if (!baseUrl) return '';
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${value}`;
    case 'address':
      return `${baseUrl}/address/${value}`;
    case 'block':
      return `${baseUrl}/block/${value}`;
    default:
      return '';
  }
}

// Format transaction hash for display
export function formatTxHash(hash: string, length = 8): string {
  if (hash.length <= length * 2 + 2) return hash;
  return `${hash.substring(0, length + 2)}...${hash.substring(hash.length - length)}`;
}
