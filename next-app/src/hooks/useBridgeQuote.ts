import { useQuery } from '@tanstack/react-query';
import { Token } from '@/types';
import { formatUnits, parseUnits } from 'viem';

interface BridgeQuoteParams {
  fromChain: number;
  toChain: number;
  fromToken: Token | null;
  toToken: Token | null;
  amount: string;
  recipient?: string;
  slippage?: number;
  enabled?: boolean;
}

interface BridgeQuoteResponse {
  fromToken: Token;
  toToken: Token;
  fromChain: number;
  toChain: number;
  amountIn: string;
  amountOut: string;
  minAmountOut: string;
  exchangeRate: string;
  fee: string;
  feeToken: Token;
  estimatedTime: number; // in seconds
  route: Array<{
    name: string;
    part: number;
    fromToken: Token;
    toToken: Token;
  }>;
}

// Mock bridge fee in basis points (0.1%)
const BRIDGE_FEE_BPS = 10; // 0.1%

// Mock estimated time in seconds based on chain
const getEstimatedTime = (fromChain: number, toChain: number): number => {
  const isL2 = fromChain !== 1 && toChain !== 1; // Not Ethereum
  return isL2 ? 300 : 900; // 5 minutes for L2->L2, 15 minutes for L1->L2 or L2->L1
};

export function useBridgeQuote({
  fromChain,
  toChain,
  fromToken,
  toToken,
  amount,
  recipient,
  slippage = 0.5, // 0.5% default slippage
  enabled = true,
}: BridgeQuoteParams) {
  return useQuery<BridgeQuoteResponse, Error>({
    queryKey: [
      'bridgeQuote',
      fromChain,
      toChain,
      fromToken?.address,
      toToken?.address,
      amount,
      recipient,
    ],
    queryFn: async () => {
      if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid parameters for bridge quote');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const amountIn = parseUnits(amount, fromToken.decimals);
      
      // Calculate bridge fee (0.1% of amount)
      const feeAmount = (amountIn * BigInt(BRIDGE_FEE_BPS)) / 10000n;
      const amountAfterFee = amountIn - feeAmount;
      
      // Simple 1:1 exchange rate for stablecoins, 1:2000 for ETH/USDC for demo purposes
      const isStablecoin = ['USDC', 'USDT', 'DAI'].includes(fromToken.symbol) && 
                          ['USDC', 'USDT', 'DAI'].includes(toToken.symbol);
      
      let exchangeRate = '1.0';
      let amountOut = amountAfterFee;
      
      if (fromToken.symbol === 'ETH' && toToken.symbol === 'USDC') {
        exchangeRate = '2000'; // 1 ETH = 2000 USDC
        amountOut = (amountAfterFee * 2000n) / (10n ** BigInt(18 - 6)); // Adjust for decimals
      } else if (fromToken.symbol === 'USDC' && toToken.symbol === 'ETH') {
        exchangeRate = '0.0005'; // 1 USDC = 0.0005 ETH
        amountOut = (amountAfterFee * (10n ** 12n)) / 2000n; // Adjust for decimals (18-6=12)
      } else if (!isStablecoin) {
        // For other non-stable pairs, use a random exchange rate for demo
        const randomRate = 0.5 + Math.random(); // 0.5 to 1.5
        exchangeRate = randomRate.toFixed(4);
        const rateBigInt = parseUnits(exchangeRate, 18);
        const decimalsDiff = BigInt(10 ** (18 + toToken.decimals - fromToken.decimals));
        amountOut = (amountAfterFee * rateBigInt) / decimalsDiff;
      }
      
      // Apply slippage to min amount out
      const slippageBps = BigInt(Math.floor(slippage * 100));
      const minAmountOut = (amountOut * (10000n - slippageBps)) / 10000n;
      
      // Create response
      const estimatedTime = getEstimatedTime(fromChain, toChain);
      
      return {
        fromToken,
        toToken,
        fromChain,
        toChain,
        amountIn: amount,
        amountOut: formatUnits(amountOut, toToken.decimals),
        minAmountOut: formatUnits(minAmountOut, toToken.decimals),
        exchangeRate,
        fee: formatUnits(feeAmount, fromToken.decimals),
        feeToken: fromToken,
        estimatedTime,
        route: [
          {
            name: 'Etherlink Bridge',
            part: 100,
            fromToken,
            toToken,
          },
        ],
      };
    },
    enabled: 
      enabled && 
      !!fromToken && 
      !!toToken && 
      !!amount && 
      parseFloat(amount) > 0 &&
      fromChain !== toChain,
    retry: 2,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
