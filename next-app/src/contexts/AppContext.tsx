'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { BridgeStatus, BridgeTransaction, Token } from '@/types';
import { useQuery } from '@tanstack/react-query';

type AppState = {
  // Bridge state
  fromChain: number;
  toChain: number;
  fromToken: Token | null;
  toToken: Token | null;
  amount: string;
  recipient: string;
  status: BridgeStatus;
  transactions: BridgeTransaction[];
  
  // UI state
  isConnecting: boolean;
  isSwitchingChains: boolean;
  isBridging: boolean;
  error: string | null;
};

type AppAction =
  | { type: 'SET_FROM_CHAIN'; chainId: number }
  | { type: 'SET_TO_CHAIN'; chainId: number }
  | { type: 'SET_FROM_TOKEN'; token: Token | null }
  | { type: 'SET_TO_TOKEN'; token: Token | null }
  | { type: 'SET_AMOUNT'; amount: string }
  | { type: 'SET_RECIPIENT'; address: string }
  | { type: 'SET_STATUS'; status: BridgeStatus }
  | { type: 'ADD_TRANSACTION'; transaction: BridgeTransaction }
  | { type: 'SET_IS_CONNECTING'; isConnecting: boolean }
  | { type: 'SET_IS_SWITCHING_CHAINS'; isSwitchingChains: boolean }
  | { type: 'SET_IS_BRIDGING'; isBridging: boolean }
  | { type: 'SET_ERROR'; error: string | null };

const initialState: AppState = {
  // Default to Ethereum mainnet and Arbitrum
  fromChain: 1,
  toChain: 42161,
  fromToken: null,
  toToken: null,
  amount: '',
  recipient: '',
  status: 'idle',
  transactions: [],
  isConnecting: false,
  isSwitchingChains: false,
  isBridging: false,
  error: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  switchChains: () => void;
  executeBridge: () => Promise<void>;
  resetBridge: () => void;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FROM_CHAIN':
      return { ...state, fromChain: action.chainId };
    case 'SET_TO_CHAIN':
      return { ...state, toChain: action.chainId };
    case 'SET_FROM_TOKEN':
      return { ...state, fromToken: action.token };
    case 'SET_TO_TOKEN':
      return { ...state, toToken: action.token };
    case 'SET_AMOUNT':
      return { ...state, amount: action.amount };
    case 'SET_RECIPIENT':
      return { ...state, recipient: action.address };
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.transaction, ...state.transactions],
      };
    case 'SET_IS_CONNECTING':
      return { ...state, isConnecting: action.isConnecting };
    case 'SET_IS_SWITCHING_CHAINS':
      return { ...state, isSwitchingChains: action.isSwitchingChains };
    case 'SET_IS_BRIDGING':
      return { ...state, isBridging: action.isBridging };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  // Set recipient to connected wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      dispatch({ type: 'SET_RECIPIENT', address });
    }
  }, [isConnected, address]);

  // Sync chain with wallet
  useEffect(() => {
    if (chain) {
      dispatch({ type: 'SET_FROM_CHAIN', chainId: chain.id });
    }
  }, [chain]);

  // Switch from and to chains
  const switchChains = useCallback(() => {
    dispatch({ type: 'SET_FROM_CHAIN', chainId: state.toChain });
    dispatch({ type: 'SET_TO_CHAIN', chainId: state.fromChain });
    
    const tempToken = state.fromToken;
    dispatch({ type: 'SET_FROM_TOKEN', token: state.toToken });
    dispatch({ type: 'SET_TO_TOKEN', token: tempToken });
  }, [state.fromChain, state.toChain, state.fromToken, state.toToken]);

  // Execute bridge transaction
  const executeBridge = useCallback(async () => {
    if (!state.fromToken || !state.toToken || !state.amount) {
      dispatch({ type: 'SET_ERROR', error: 'Please fill in all fields' });
      return;
    }

    if (!isConnected || !address) {
      dispatch({ type: 'SET_ERROR', error: 'Please connect your wallet' });
      return;
    }

    try {
      dispatch({ type: 'SET_IS_BRIDGING', isBridging: true });
      dispatch({ type: 'SET_STATUS', status: 'approving' });
      
      // TODO: Implement actual bridge logic here
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction: BridgeTransaction = {
        id: `tx-${Date.now()}`,
        fromChain: state.fromChain,
        toChain: state.toChain,
        fromToken: state.fromToken,
        toToken: state.toToken,
        amount: state.amount,
        recipient: state.recipient || address,
        status: 'pending',
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };
      
      dispatch({ type: 'ADD_TRANSACTION', transaction: newTransaction });
      dispatch({ type: 'SET_STATUS', status: 'bridging' });
      
      // Simulate bridge completion
      setTimeout(() => {
        dispatch({
          type: 'ADD_TRANSACTION',
          transaction: { ...newTransaction, status: 'completed' },
        });
        dispatch({ type: 'SET_STATUS', status: 'completed' });
        dispatch({ type: 'SET_IS_BRIDGING', isBridging: false });
      }, 5000);
      
    } catch (error) {
      console.error('Bridge error:', error);
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Bridge failed' });
      dispatch({ type: 'SET_STATUS', status: 'failed' });
      dispatch({ type: 'SET_IS_BRIDGING', isBridging: false });
    }
  }, [state, isConnected, address]);

  // Reset bridge form
  const resetBridge = useCallback(() => {
    dispatch({ type: 'SET_AMOUNT', amount: '' });
    dispatch({ type: 'SET_STATUS', status: 'idle' });
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        switchChains,
        executeBridge,
        resetBridge,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
