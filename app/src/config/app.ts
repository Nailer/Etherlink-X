// Application configuration
export const APP_CONFIG = {
  name: 'Etherlink-X',
  description: 'Cross-chain DeFi hub and aggregator on Etherlink L2',
  version: '0.1.0',
  author: 'Etherlink Team',
  social: {
    twitter: 'https://twitter.com/etherlink',
    github: 'https://github.com/etherlink/etherlink-x',
    discord: 'https://discord.gg/etherlink',
  },
  contracts: {
    // Will be populated from environment variables in production
    crossChainRouter: {
      // Example: '0x1234...'
    },
  },
  defaultChainId: 1, // Ethereum Mainnet
  supportedChains: [1, 11155111, 10, 42161, 43113], // Mainnet, Sepolia, Optimism, Arbitrum, Avalanche Fuji
  rpcUrls: {
    1: 'https://eth.llamarpc.com',
    11155111: 'https://ethereum-sepolia.publicnode.com',
    10: 'https://optimism.publicnode.com',
    42161: 'https://arbitrum.llama-rpc.com',
    43113: 'https://avalanche-fuji-c-chain.publicnode.com',
  },
  blockExplorers: {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    10: 'https://optimistic.etherscan.io',
    42161: 'https://arbiscan.io',
    43113: 'https://testnet.snowtrace.io',
  },
  nativeCurrency: {
    1: { symbol: 'ETH', decimals: 18 },
    11155111: { symbol: 'SEP', decimals: 18 },
    10: { symbol: 'ETH', decimals: 18 },
    42161: { symbol: 'ETH', decimals: 18 },
    43113: { symbol: 'AVAX', decimals: 18 },
  },
  // Default gas settings
  defaultGasLimit: 200000,
  defaultGasPrice: '50', // gwei
  // API endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    endpoints: {
      quote: '/quote',
      routes: '/routes',
      tokens: '/tokens',
      chains: '/chains',
    },
  },
  // Feature flags
  features: {
    bridge: true,
    swap: false, // Coming soon
    vaults: false, // Coming soon
    analytics: false, // Coming soon
  },
} as const;

// Token list configuration
export const TOKEN_LISTS = {
  default: [
    'https://tokens.coingecko.com/ethereum/all.json',
    'https://tokens.uniswap.org/',
  ],
  // Add more token lists as needed
};

// Theme configuration
export const THEME_CONFIG = {
  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    secondary: '#10B981',
    secondaryDark: '#059669',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    dark: {
      bg: '#111827',
      surface: '#1F2937',
      surfaceLight: '#374151',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
    },
    light: {
      bg: '#F9FAFB',
      surface: '#FFFFFF',
      surfaceLight: '#F3F4F6',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Export types
export type AppConfig = typeof APP_CONFIG;
export type ThemeConfig = typeof THEME_CONFIG;
