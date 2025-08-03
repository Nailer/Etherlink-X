// Chain and network types
export interface ChainInfo {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet?: boolean;
  logoURI?: string;
}

// Token types
export interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  priceUSD?: number;
  balance?: string;
  balanceRaw?: bigint;
}

// Bridge route types
export interface BridgeRoute {
  bridgeId: string;
  bridgeName: string;
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  amountIn: string;
  amountOut: string;
  minAmountOut: string;
  feeAmount: string;
  feeToken: string;
  estimatedTime: number; // in seconds
  slippage: number;
  steps: BridgeStep[];
}

export interface BridgeStep {
  type: 'swap' | 'bridge' | 'deposit' | 'withdraw';
  protocol: string;
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  amountIn: string;
  amountOut: string;
  feeAmount: string;
  feeToken: string;
  estimatedTime: number; // in seconds
}

// Transaction types
export interface TransactionReceipt {
  transactionHash: string;
  from: string;
  to: string;
  status: 'pending' | 'success' | 'failed' | 'reverted';
  blockNumber?: number;
  timestamp?: number;
  gasUsed?: bigint;
  gasPrice?: bigint;
  logs?: any[];
  events?: any[];
  confirmations?: number;
  chainId: number;
}

export interface TransactionRequest {
  from: string;
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  chainId: number;
}

// Bridge transaction status
export enum BridgeStatus {
  PENDING = 'PENDING',
  CONFIRMING = 'CONFIRMING',
  CONFIRMED = 'CONFIRMED',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface BridgeTransaction {
  id: string;
  txHash: string;
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
  status: BridgeStatus;
  timestamp: number;
  updatedAt: number;
  steps: BridgeStep[];
  currentStep: number;
  retryCount: number;
  error?: string;
  receipt?: TransactionReceipt;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
}

// Price data
export interface PriceData {
  token: string;
  price: number;
  price24hChange: number;
  volume24h: number;
  marketCap?: number;
  lastUpdated: number;
}

// User settings
export interface UserSettings {
  slippageTolerance: number; // in basis points (e.g., 50 = 0.5%)
  transactionDeadline: number; // in minutes
  defaultGasPrice: 'fast' | 'average' | 'slow';
  theme: 'light' | 'dark' | 'system';
  hideSmallBalances: boolean;
  showTestnets: boolean;
  customRpcUrls: Record<number, string>;
  lastUsedAccount?: string;
  lastUsedChainId?: number;
}

// App state
export interface AppState {
  isInitialized: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  isWrongNetwork: boolean;
  account?: string;
  chainId?: number;
  blockNumber?: number;
  error?: string;
  balances: Record<string, string>;
  transactions: BridgeTransaction[];
  settings: UserSettings;
}

// Event types for Web3 provider
export type Web3Event = 
  | { type: 'CONNECTED'; payload: { account: string; chainId: number } }
  | { type: 'DISCONNECTED' }
  | { type: 'ACCOUNT_CHANGED'; payload: { account: string } }
  | { type: 'CHAIN_CHANGED'; payload: { chainId: number } }
  | { type: 'BALANCE_UPDATED'; payload: { token: string; balance: string } }
  | { type: 'TRANSACTION', payload: { txHash: string; status: 'pending' | 'success' | 'failed' } };

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type { Address } from 'viem';

// Re-export common types from viem for convenience
export type { 
  Hash, 
  Hex, 
  Chain, 
  PublicClient, 
  WalletClient, 
  TransactionReceipt as ViemTransactionReceipt,
  TransactionRequest as ViemTransactionRequest,
} from 'viem';
