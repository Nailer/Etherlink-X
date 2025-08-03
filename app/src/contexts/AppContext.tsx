import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useBridge } from '@/hooks/useBridge';
import { TokenSymbol, type TokenInfo, type BridgeTransaction, BridgeStatus } from '@/types';
import { APP_CONFIG } from '@/config/web3';
import { toast } from 'react-hot-toast';
import { parseEther, formatEther } from 'viem';

type AppState = {
  // Selected token for the bridge
  selectedToken: TokenSymbol | null;
  // Source and destination chains
  sourceChainId: number;
  destinationChainId: number;
  // Token amounts
  amount: string;
  // Transaction history
  transactions: BridgeTransaction[];
  // Loading states
  isFetchingRoutes: boolean;
  isBridging: boolean;
  // Bridge route
  route: {
    fromChainId: number;
    toChainId: number;
    fromToken: string;
    toToken: string;
    amountIn: string;
    amountOut: string;
    feeAmount: string;
    feeToken: string;
    estimatedTime: number;
    steps: Array<{
      type: string;
      protocol: string;
      fromChainId: number;
      toChainId: number;
      fromToken: string;
      toToken: string;
      amountIn: string;
      amountOut: string;
      feeAmount: string;
      feeToken: string;
      estimatedTime: number;
      completed?: boolean;
    }>;
  } | null;
  // Error states
  error: string | null;
};

type AppAction =
  | { type: 'SET_SELECTED_TOKEN'; payload: TokenSymbol | null }
  | { type: 'SET_SOURCE_CHAIN'; payload: number }
  | { type: 'SET_DESTINATION_CHAIN'; payload: number }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_ROUTE'; payload: AppState['route'] }
  | { type: 'ADD_TRANSACTION'; payload: BridgeTransaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<BridgeTransaction> } }
  | { type: 'SET_IS_FETCHING_ROUTES'; payload: boolean }
  | { type: 'SET_IS_BRIDGING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  selectedToken: 'WETH',
  sourceChainId: 1, // Default to Ethereum
  destinationChainId: 10, // Default to Optimism
  amount: '',
  transactions: [],
  isFetchingRoutes: false,
  isBridging: false,
  route: null,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SELECTED_TOKEN':
      return { ...state, selectedToken: action.payload };
    
    case 'SET_SOURCE_CHAIN':
      // If the new source chain is the same as the current destination, swap them
      if (action.payload === state.destinationChainId) {
        return { 
          ...state, 
          sourceChainId: state.destinationChainId,
          destinationChainId: state.sourceChainId,
        };
      }
      return { ...state, sourceChainId: action.payload };
    
    case 'SET_DESTINATION_CHAIN':
      // If the new destination chain is the same as the current source, swap them
      if (action.payload === state.sourceChainId) {
        return { 
          ...state, 
          sourceChainId: state.destinationChainId,
          destinationChainId: state.sourceChainId,
        };
      }
      return { ...state, destinationChainId: action.payload };
    
    case 'SET_AMOUNT':
      return { 
        ...state, 
        amount: action.payload,
        // Reset route when amount changes
        route: null,
        error: null,
      };
      
    case 'SET_ROUTE':
      return { ...state, route: action.payload };
    
    case 'ADD_TRANSACTION':
      return { 
        ...state, 
        transactions: [action.payload, ...state.transactions].slice(0, 50), // Keep only the last 50 transactions
      };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(tx => 
          tx.id === action.payload.id 
            ? { ...tx, ...action.payload.updates, updatedAt: Date.now() } 
            : tx
        ),
      };
    
    case 'SET_IS_FETCHING_ROUTES':
      return { ...state, isFetchingRoutes: action.payload };
    
    case 'SET_IS_BRIDGING':
      return { ...state, isBridging: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper methods
  switchChains: () => void;
  resetForm: () => void;
  // Transaction methods
  addTransaction: (tx: Omit<BridgeTransaction, 'id' | 'timestamp' | 'updatedAt' | 'status'>) => string;
  updateTransaction: (id: string, updates: Partial<BridgeTransaction>) => void;
  // Bridge methods
  bridgeTokens: () => Promise<void>;
  // Transaction details
  transactionDetails: {
    exchangeRate: number;
    feePercentage: string;
    estimatedTime: number;
    amountOut: string;
    amountOutUsd: string;
  } | null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { address, isConnected, chainId, switchNetwork } = useWeb3();

  // Reset form when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      dispatch({ type: 'SET_AMOUNT', payload: '' });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [isConnected]);

  // Switch source and destination chains
  const switchChains = useCallback(() => {
    dispatch({ 
      type: 'SET_SOURCE_CHAIN', 
      payload: state.destinationChainId 
    });
  }, [state.destinationChainId]);

  // Reset the bridge form
  const resetForm = useCallback(() => {
    dispatch({ type: 'SET_AMOUNT', payload: '' });
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Add a new transaction to the history
  const addTransaction = useCallback((tx: Omit<BridgeTransaction, 'id' | 'timestamp' | 'updatedAt' | 'status'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newTx: BridgeTransaction = {
      ...tx,
      id,
      timestamp: Date.now(),
      updatedAt: Date.now(),
      status: BridgeStatus.PENDING,
    };
    
    dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
    return id;
  }, []);

  // Update an existing transaction
  const updateTransaction = useCallback((id: string, updates: Partial<BridgeTransaction>) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
  }, []);

  // Bridge hooks
  const { executeBridge, isLoading: isBridgeLoading } = useBridge();
  const isMounted = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Update loading state when bridge loading changes
  useEffect(() => {
    if (isMounted.current) {
      dispatch({ type: 'SET_IS_BRIDGING', payload: isBridgeLoading });
    }
  }, [isBridgeLoading]);
  
  // Bridge tokens between chains
  const bridgeTokens = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!state.selectedToken) {
      toast.error('Please select a token to bridge');
      return;
    }

    const amount = parseFloat(state.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Format amount string to avoid scientific notation for very small numbers
    const amountStr = amount.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 18 });

    // Check if we need to switch chains
    if (chainId !== state.sourceChainId) {
      try {
        await switchNetwork(state.sourceChainId);
      } catch (error) {
        console.error('Failed to switch network:', error);
        toast.error('Failed to switch network');
        return;
      }
    }

    try {
      dispatch({ type: 'SET_IS_BRIDGING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Create a new transaction
      const txId = addTransaction({
        txHash: `pending_${Date.now()}`,
        fromChainId: state.sourceChainId,
        toChainId: state.destinationChainId,
        fromToken: state.selectedToken!,
        toToken: state.selectedToken!,
        amount: amountStr,
        recipient: address,
        status: BridgeStatus.PENDING,
        steps: [],
        currentStep: 0,
        retryCount: 0,
        timestamp: Date.now(),
        updatedAt: Date.now(),
      });

      // Execute the bridge transaction
      await executeBridge(
        txId,
        state.sourceChainId,
        state.destinationChainId,
        state.selectedToken!,
        amountStr,
        address
      );
      
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error('Bridge error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to bridge tokens';
      
      if (isMounted.current) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: errorMessage,
        });
      }
      
      toast.error(errorMessage);
    } finally {
      if (isMounted.current) {
        dispatch({ type: 'SET_IS_BRIDGING', payload: false });
      }
    }
  }, [
    isConnected, 
    address, 
    chainId, 
    state.selectedToken, 
    state.amount, 
    state.sourceChainId, 
    state.destinationChainId,
    addTransaction, 
    updateTransaction, 
    resetForm,
    switchNetwork,
    executeBridge,
  ]);
  
  // Update route when amount, token, or chains change
  useEffect(() => {
    const updateRoute = async () => {
      if (!state.selectedToken || !state.amount || parseFloat(state.amount) <= 0) {
        dispatch({ type: 'SET_ROUTE', payload: null });
        return;
      }
      
      try {
        dispatch({ type: 'SET_IS_FETCHING_ROUTES', payload: true });
        
        // In a real app, this would fetch routes from an API or smart contract
        // For now, we'll simulate a route calculation
        const amount = parseFloat(state.amount);
        const feeAmount = amount * 0.001; // 0.1% fee
        const amountOut = amount - feeAmount;
        
        const route = {
          fromChainId: state.sourceChainId,
          toChainId: state.destinationChainId,
          fromToken: state.selectedToken,
          toToken: state.selectedToken,
          amountIn: state.amount,
          amountOut: amountOut.toString(),
          feeAmount: feeAmount.toString(),
          feeToken: state.selectedToken,
          estimatedTime: 300, // 5 minutes
          steps: [
            {
              type: 'bridge',
              protocol: 'Etherlink-X',
              fromChainId: state.sourceChainId,
              toChainId: state.destinationChainId,
              fromToken: state.selectedToken,
              toToken: state.selectedToken,
              amountIn: state.amount,
              amountOut: amountOut.toString(),
              feeAmount: feeAmount.toString(),
              feeToken: state.selectedToken,
              estimatedTime: 300, // 5 minutes
            },
          ],
        };
        
        dispatch({ type: 'SET_ROUTE', payload: route });
      } catch (error) {
        console.error('Error updating route:', error);
        dispatch({ type: 'SET_ROUTE', payload: null });
      } finally {
        if (isMounted.current) {
          dispatch({ type: 'SET_IS_FETCHING_ROUTES', payload: false });
        }
      }
    };
    
    const debounceTimer = setTimeout(updateRoute, 500);
    return () => clearTimeout(debounceTimer);
  }, [state.amount, state.selectedToken, state.sourceChainId, state.destinationChainId]);

  // Calculate transaction details
  const transactionDetails = useMemo(() => {
    if (!state.route) return null;
    
    const { amountIn, amountOut, feeAmount, feeToken, estimatedTime } = state.route;
    const amountInNum = parseFloat(amountIn);
    const amountOutNum = parseFloat(amountOut);
    const feeAmountNum = parseFloat(feeAmount);
    
    // In a real app, this would use actual token prices
    const tokenPrice = 1.5; // Mock price
    
    return {
      exchangeRate: 1, // 1:1 for now
      feePercentage: (feeAmountNum / amountInNum * 100).toFixed(2),
      estimatedTime,
      amountOut,
      amountOutUsd: (amountOutNum * tokenPrice).toFixed(2),
    };
  }, [state.route]);
  
  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        switchChains,
        resetForm,
        addTransaction,
        updateTransaction,
        bridgeTokens,
        transactionDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
