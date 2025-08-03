import { useState, useEffect, useReducer } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { formatAddress, formatTokenAmount, formatUSD } from '@/utils/format';
import { CHAIN_IDS, TOKEN_METADATA } from '@/config/web3';
import TokenSelector from '@/components/TokenSelector';
import SwapArrowsButton from '@/components/SwapArrowsButton';
import BridgeButton from '@/components/BridgeButton';
import TransactionStatus from '@/components/TransactionStatus';

// Mock data - in a real app, this would come from your smart contracts or API
const MOCK_PRICES = {
  WETH: 3500.42,
  USDC: 1.0,
  DAI: 0.99,
  USDT: 1.01,
};

// Transaction type
type Transaction = {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  fromChain: number;
  toChain: number;
  token: string;
  amount: string;
  timestamp: number;
};

// Reducer state type
type BridgeState = {
  selectedToken: string | null;
  sourceChain: number | null;
  destinationChain: number | null;
  amount: string;
  transactions: Transaction[];
};

// Reducer action type
type BridgeAction =
  | { type: 'SET_SELECTED_TOKEN'; payload: string }
  | { type: 'SET_SOURCE_CHAIN'; payload: number }
  | { type: 'SET_DESTINATION_CHAIN'; payload: number }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction };

// Initial state
const initialState: BridgeState = {
  selectedToken: null,
  sourceChain: CHAIN_IDS.SEPOLIA,
  destinationChain: CHAIN_IDS.ARBITRUM,
  amount: '',
  transactions: [],
};

// Reducer function
function bridgeReducer(state: BridgeState, action: BridgeAction): BridgeState {
  switch (action.type) {
    case 'SET_SELECTED_TOKEN':
      return { ...state, selectedToken: action.payload };
    case 'SET_SOURCE_CHAIN':
      return { ...state, sourceChain: action.payload };
    case 'SET_DESTINATION_CHAIN':
      return { ...state, destinationChain: action.payload };
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    default:
      return state;
  }
}

type TokenSymbol = keyof typeof TOKEN_METADATA;

interface TokenCardProps {
  symbol: TokenSymbol;
  balance: string;
  price: number;
  onSelect: (symbol: TokenSymbol) => void;
  isSelected: boolean;
}

const TokenCard = ({ symbol, balance, price, onSelect, isSelected }: TokenCardProps) => {
  const tokenInfo = TOKEN_METADATA[symbol];
  const balanceValue = parseFloat(balance) * price;
  
  return (
    <div 
      className={`p-4 rounded-xl border ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'} hover:border-primary-300 dark:hover:border-primary-500 transition-colors cursor-pointer`}
      onClick={() => onSelect(symbol)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{tokenInfo.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {formatTokenAmount(balance, tokenInfo.decimals)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatUSD(balanceValue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { address, isConnected, balances, isLoadingBalances } = useWeb3();
  const [state, dispatch] = useReducer(bridgeReducer, initialState);
  const [portfolioValue, setPortfolioValue] = useState(0);
  
  // Calculate portfolio value when balances change
  useEffect(() => {
    if (isConnected && balances) {
      const total = Object.entries(balances).reduce((sum, [symbol, balance]) => {
        const price = MOCK_PRICES[symbol as keyof typeof MOCK_PRICES] || 0;
        return sum + (parseFloat(balance) * price);
      }, 0);
      setPortfolioValue(total);
    }
  }, [isConnected, balances]);
  
  const handleSourceTokenSelect = (token: string) => {
    dispatch({ type: 'SET_SELECTED_TOKEN', payload: token });
  };
  
  const handleSourceChainSelect = (chainId: number) => {
    dispatch({ type: 'SET_SOURCE_CHAIN', payload: chainId });
  };
  
  const handleDestinationChainSelect = (chainId: number) => {
    dispatch({ type: 'SET_DESTINATION_CHAIN', payload: chainId });
  };
  
  // Mock transactions data
  const transactions: Transaction[] = [
    // Add mock transactions here if needed
  ];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cross-Chain Bridge</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Transfer tokens between different blockchains with the best rates and lowest fees
      </p>
      
      <div className="space-y-6">
        {/* Bridge Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Bridge Tokens</h2>
            
            <div className="space-y-4">
              {/* Source Token */}
              <TokenSelector 
                type="source"
                onTokenSelect={handleSourceTokenSelect}
                onChainSelect={handleSourceChainSelect}
              />
              
              {/* Swap Arrows */}
              <SwapArrowsButton />
              
              {/* Destination Token */}
              <TokenSelector 
                type="destination"
                onChainSelect={handleDestinationChainSelect}
                disabled={!state.selectedToken}
              />
              
              {/* Bridge Button */}
              <BridgeButton />
            </div>
            
            {/* Transaction Details */}
            {state.amount && state.selectedToken && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Transaction Details</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Exchange Rate</span>
                    <span className="font-medium">1 {state.selectedToken} = 1.0 {state.selectedToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Bridge Fee</span>
                    <span className="font-medium">0.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Estimated Time</span>
                    <span className="font-medium">~5 minutes</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">You will receive</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {(parseFloat(state.amount) * 0.999).toFixed(6)} {state.selectedToken}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ~${(parseFloat(state.amount) * 1.5 * 0.999).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Transactions</h2>
            
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <TransactionStatus key={tx.id} transaction={tx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent transactions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
