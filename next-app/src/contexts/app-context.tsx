'use client';

import * as React from 'react';
import { Chain, Token, BridgeTransaction, TransactionStatus } from '@/types';

type AppState = {
  // Bridge state
  fromChain: Chain | null;
  toChain: Chain | null;
  fromToken: Token | null;
  toToken: Token | null;
  amount: string;
  recipient: string;
  slippage: number;
  transactions: BridgeTransaction[];
  transactionStatus: TransactionStatus;
  
  // UI state
  isConnecting: boolean;
  isBridging: boolean;
  error: string | null;
  
  // Settings
  autoRefresh: boolean;
  expertMode: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
};

type AppAction =
  | { type: 'SET_FROM_CHAIN'; payload: Chain | null }
  | { type: 'SET_TO_CHAIN'; payload: Chain | null }
  | { type: 'SET_FROM_TOKEN'; payload: Token | null }
  | { type: 'SET_TO_TOKEN'; payload: Token | null }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_RECIPIENT'; payload: string }
  | { type: 'SET_SLIPPAGE'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: BridgeTransaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Partial<BridgeTransaction> & { id: string } }
  | { type: 'SET_TRANSACTION_STATUS'; payload: TransactionStatus }
  | { type: 'SET_IS_CONNECTING'; payload: boolean }
  | { type: 'SET_IS_BRIDGING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_AUTO_REFRESH' }
  | { type: 'TOGGLE_EXPERT_MODE' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SWAP_CHAINS' };

const initialState: AppState = {
  // Bridge state
  fromChain: null,
  toChain: null,
  fromToken: null,
  toToken: null,
  amount: '',
  recipient: '',
  slippage: 0.5, // 0.5% default slippage
  transactions: [],
  transactionStatus: 'idle',
  
  // UI state
  isConnecting: false,
  isBridging: false,
  error: null,
  
  // Settings
  autoRefresh: true,
  expertMode: false,
  
  // Theme
  theme: 'system',
};

const AppContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FROM_CHAIN':
      return { ...state, fromChain: action.payload };
      
    case 'SET_TO_CHAIN':
      return { ...state, toChain: action.payload };
      
    case 'SWAP_CHAINS': {
      // If we have a fromChain and toChain, swap them
      if (state.fromChain && state.toChain) {
        return {
          ...state,
          fromChain: state.toChain,
          toChain: state.fromChain,
          fromToken: state.toToken,
          toToken: state.fromToken,
        };
      }
      return state;
    }
      
    case 'SET_FROM_TOKEN':
      return { ...state, fromToken: action.payload };
      
    case 'SET_TO_TOKEN':
      return { ...state, toToken: action.payload };
      
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
      
    case 'SET_RECIPIENT':
      return { ...state, recipient: action.payload };
      
    case 'SET_SLIPPAGE':
      return { ...state, slippage: action.payload };
      
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
      
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.id ? { ...tx, ...action.payload } : tx
        ),
      };
      
    case 'SET_TRANSACTION_STATUS':
      return { ...state, transactionStatus: action.payload };
      
    case 'SET_IS_CONNECTING':
      return { ...state, isConnecting: action.payload };
      
    case 'SET_IS_BRIDGING':
      return { ...state, isBridging: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'TOGGLE_AUTO_REFRESH':
      return { ...state, autoRefresh: !state.autoRefresh };
      
    case 'TOGGLE_EXPERT_MODE':
      return { ...state, expertMode: !state.expertMode };
      
    case 'SET_THEME':
      return { ...state, theme: action.payload };
      
    default:
      return state;
  }
}

type AppProviderProps = {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
};

export function AppProvider({ children, initialState: initialStateProp }: AppProviderProps) {
  const [state, dispatch] = React.useReducer(
    appReducer,
    { ...initialState, ...initialStateProp }
  );

  // Load saved state from localStorage on mount
  React.useEffect(() => {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Only load non-sensitive state
        dispatch({
          type: 'SET_THEME',
          payload: parsedState.theme || 'system',
        });
        dispatch({
          type: 'SET_SLIPPAGE',
          payload: parsedState.slippage || 0.5,
        });
        dispatch({
          type: 'SET_AUTO_REFRESH',
          payload: parsedState.autoRefresh !== false, // default to true
        });
        dispatch({
          type: 'SET_EXPERT_MODE',
          payload: parsedState.expertMode || false,
        });
      }
    } catch (error) {
      console.error('Failed to load app state from localStorage', error);
    }
  }, []);

  // Save state to localStorage when it changes
  React.useEffect(() => {
    try {
      const stateToSave = {
        theme: state.theme,
        slippage: state.slippage,
        autoRefresh: state.autoRefresh,
        expertMode: state.expertMode,
      };
      localStorage.setItem('appState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save app state to localStorage', error);
    }
  }, [state.theme, state.slippage, state.autoRefresh, state.expertMode]);

  // Apply theme class to document element
  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    if (state.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(state.theme);
    }
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Helper hooks for common actions
export function useSetFromChain() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (chain: Chain | null) => dispatch({ type: 'SET_FROM_CHAIN', payload: chain }),
    [dispatch]
  );
}

export function useSetToChain() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (chain: Chain | null) => dispatch({ type: 'SET_TO_CHAIN', payload: chain }),
    [dispatch]
  );
}

export function useSwapChains() {
  const { dispatch } = useAppContext();
  return React.useCallback(() => dispatch({ type: 'SWAP_CHAINS' }), [dispatch]);
}

export function useSetFromToken() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (token: Token | null) => dispatch({ type: 'SET_FROM_TOKEN', payload: token }),
    [dispatch]
  );
}

export function useSetToToken() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (token: Token | null) => dispatch({ type: 'SET_TO_TOKEN', payload: token }),
    [dispatch]
  );
}

export function useSetAmount() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (amount: string) => dispatch({ type: 'SET_AMOUNT', payload: amount }),
    [dispatch]
  );
}

export function useSetRecipient() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (recipient: string) => dispatch({ type: 'SET_RECIPIENT', payload: recipient }),
    [dispatch]
  );
}

export function useSetSlippage() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (slippage: number) => dispatch({ type: 'SET_SLIPPAGE', payload: slippage }),
    [dispatch]
  );
}

export function useAddTransaction() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (transaction: BridgeTransaction) =>
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction }),
    [dispatch]
  );
}

export function useUpdateTransaction() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (transaction: Partial<BridgeTransaction> & { id: string }) =>
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction }),
    [dispatch]
  );
}

export function useSetTransactionStatus() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (status: TransactionStatus) =>
      dispatch({ type: 'SET_TRANSACTION_STATUS', payload: status }),
    [dispatch]
  );
}

export function useSetIsConnecting() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (isConnecting: boolean) =>
      dispatch({ type: 'SET_IS_CONNECTING', payload: isConnecting }),
    [dispatch]
  );
}

export function useSetIsBridging() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (isBridging: boolean) =>
      dispatch({ type: 'SET_IS_BRIDGING', payload: isBridging }),
    [dispatch]
  );
}

export function useSetError() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    [dispatch]
  );
}

export function useToggleAutoRefresh() {
  const { dispatch } = useAppContext();
  return React.useCallback(() => dispatch({ type: 'TOGGLE_AUTO_REFRESH' }), [dispatch]);
}

export function useToggleExpertMode() {
  const { dispatch } = useAppContext();
  return React.useCallback(() => dispatch({ type: 'TOGGLE_EXPERT_MODE' }), [dispatch]);
}

export function useSetTheme() {
  const { dispatch } = useAppContext();
  return React.useCallback(
    (theme: 'light' | 'dark' | 'system') =>
      dispatch({ type: 'SET_THEME', payload: theme }),
    [dispatch]
  );
}
