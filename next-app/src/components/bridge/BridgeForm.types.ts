import { Token, Chain } from '@/types';

export interface TokenWithLogo extends Token {
  logoURI: string;
}

export interface ChainExtended extends Chain {
  rpcUrl: string;
  explorerUrl: string;
  icon: string;
  isL1?: boolean;
}

export interface BridgeProvider {
  id: string;
  name: string;
  logo: string;
  fee: string;
  timeEstimate: number; // in seconds
}

export interface BridgeTransaction {
  id: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: number;
  txHash: string;
  completedAt?: number;
  error?: string;
}

export interface BridgeQuote {
  amountOut: string;
  fee: string;
  minAmountOut: string;
  estimatedTime: number; // in seconds
  provider: BridgeProvider;
  route: any[]; // Define proper type based on your route structure
  providerLogo?: string;
  feeToken?: TokenWithLogo;
}

export interface BridgeFormState {
  fromChain: ChainExtended | null;
  toChain: ChainExtended | null;
  fromToken: TokenWithLogo | null;
  toToken: TokenWithLogo | null;
  amount: string;
  recipient: string;
  slippage: string;
  isBridging: boolean;
  isLoadingQuote: boolean;
  quoteError: string | null;
  selectedQuote: BridgeQuote | null;
  allQuotes: BridgeQuote[];
}
