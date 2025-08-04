export type Chain = {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  icon: string;
  isL1: boolean;
};

export type Token = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  balance?: string;
  priceUSD?: string;
};

export type BridgeStatus = 'idle' | 'approving' | 'bridging' | 'completed' | 'failed';

export type BridgeTransaction = {
  id: string;
  fromChain: number;
  toChain: number;
  fromToken: Token;
  toToken: Token;
  amount: string;
  recipient: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  txHash: string;
  completedAt?: number;
  error?: string;
};

export type BridgeRoute = {
  fromChain: number;
  toChain: number;
  fromToken: Token;
  toToken: Token;
  amount: string;
  estimatedTime: number; // in seconds
  fee: string;
  feeToken: Token;
  minAmount: string;
  maxAmount: string;
  exchangeRate: string;
  provider: string;
  steps: Array<{
    type: 'approval' | 'bridge' | 'swap' | 'wrap' | 'unwrap';
    chainId: number;
    token: Token;
    amount: string;
    fee: string;
    feeToken: Token;
    estimatedTime: number;
    provider: string;
  }>;
};

export type TokenBalance = {
  token: Token;
  balance: string;
  priceUSD: string;
  valueUSD: string;
};

export type Portfolio = {
  totalValueUSD: string;
  chains: Array<{
    chainId: number;
    chainName: string;
    balance: string;
    tokens: TokenBalance[];
  }>;
};

export type TransactionHistory = {
  transactions: BridgeTransaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type GasPrice = {
  standard: string;
  fast: string;
  instant: string;
  timestamp: number;
};

export type GasPrices = {
  [chainId: number]: GasPrice;
};

export type TokenPrice = {
  token: string;
  price: string;
  timestamp: number;
};

export type TokenPrices = {
  [tokenAddress: string]: TokenPrice;
};
