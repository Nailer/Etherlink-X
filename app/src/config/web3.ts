import { mainnet, sepolia, optimism, arbitrum } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// List of supported chains
export const supportedChains = [mainnet, sepolia, optimism, arbitrum];

// Etherlink testnet configuration (if needed)
// Uncomment and use if Etherlink testnet is required
/*
const etherlinkTestnet = {
  id: 128123,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Tezos',
    symbol: 'XTZ',
  },
  rpcUrls: {
    default: { http: ['https://node.ghostnet.etherlink.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://testnet-explorer.etherlink.com' },
  },
  testnet: true,
} as const;

supportedChains.push(etherlinkTestnet);
*/

// Transport configuration for each chain
export const transports = {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
  [optimism.id]: http(),
  [arbitrum.id]: http(),
};

// Add Etherlink testnet to supported chains if needed
// supportedChains.push(etherlinkTestnet);

// Get the project ID from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Create the Web3 configuration
export const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    walletConnectProjectId: projectId,
    
    // Required app info
    appName: 'Etherlink-X',
    appDescription: 'Cross-chain DeFi hub and aggregator on Etherlink L2',
    appUrl: 'https://etherlink-x.vercel.app',
    appIcon: 'https://etherlink-x.vercel.app/logo.png',
    
    // Chains
    chains: supportedChains,
    
    // RPC URLs
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [optimism.id]: http(),
      [arbitrum.id]: http(),
      // Uncomment if using Avalanche Fuji testnet
      // [avalancheFuji.id]: http(),
      // [etherlinkTestnet.id]: http(etherlinkTestnet.rpcUrls.default.http[0]),
    },
    
    // Optional: Override default options
    ssr: true,
  })
);

// Export chain IDs as constants
export const CHAIN_IDS = {
  MAINNET: mainnet.id,
  SEPOLIA: sepolia.id,
  OPTIMISM: optimism.id,
  ARBITRUM: arbitrum.id,
  // Uncomment if using Avalanche Fuji testnet
  // AVALANCHE_FUJI: avalancheFuji.id,
  // ETHERLINK_TESTNET: etherlinkTestnet.id,
} as const;

export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

// Token addresses (add your token addresses here)
export const TOKEN_ADDRESSES = {
  [mainnet.id]: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  [sepolia.id]: {
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  },
  [optimism.id]: {
    WETH: '0x4200000000000000000000000000000000000006',
  },
  [arbitrum.id]: {
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  // Uncomment and update if using Etherlink testnet
  // [etherlinkTestnet.id]: {
  //   WETH: '0x1234567890abcdef1234567890abcdef12345678', // Replace with actual address
  // },
};

// Token metadata
export const TOKEN_METADATA = {
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
} as const;

// Define token symbols as a union type of all possible token symbols
export type TokenSymbol = 'WETH' | 'USDC' | 'USDT' | 'DAI' | 'WBTC';

// Application configuration
export const APP_CONFIG = {
  defaultGasLimit: 300000, // Default gas limit for transactions
  defaultSlippage: 0.5, // 0.5% default slippage
  maxSlippage: 5, // 5% max slippage
  defaultTxDeadline: 20, // 20 minutes
  supportedNetworks: [1, 10, 56, 137], // Mainnet, Optimism, BSC, Polygon
  defaultNetwork: 1, // Mainnet
  infuraId: process.env.NEXT_PUBLIC_INFURA_ID || '',
  alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID || '',
  etherscanApiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
  // Add other configuration as needed
} as const;
