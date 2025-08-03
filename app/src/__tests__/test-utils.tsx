import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { AppContext, AppProvider } from '@/contexts/AppContext';
import { AppContextType } from '@/contexts/AppContext';

// Create a test configuration
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

type TestWrapperProps = {
  children: ReactNode;
  contextValue?: Partial<AppContextType>;
};

export function TestWrapper({ children, contextValue }: TestWrapperProps) {
  const queryClient = createTestQueryClient();
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          {children}
        </AppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function createMockContext(overrides: Partial<AppContextType> = {}): AppContextType {
  const defaultContext: AppContextType = {
    state: {
      selectedToken: 'WETH',
      sourceChainId: 1,
      destinationChainId: 10,
      amount: '0.1',
      transactions: [],
      isFetchingRoutes: false,
      isBridging: false,
      route: {
        fromChainId: 1,
        toChainId: 10,
        fromToken: 'WETH',
        toToken: 'WETH',
        amountIn: '0.1',
        amountOut: '0.0999',
        feeAmount: '0.0001',
        feeToken: 'WETH',
        estimatedTime: 300,
        steps: [
          {
            type: 'bridge',
            protocol: 'Etherlink-X',
            fromChainId: 1,
            toChainId: 10,
            fromToken: 'WETH',
            toToken: 'WETH',
            amountIn: '0.1',
            amountOut: '0.0999',
            feeAmount: '0.0001',
            feeToken: 'WETH',
            estimatedTime: 300,
          },
        ],
      },
      error: null,
    },
    dispatch: jest.fn(),
    switchChains: jest.fn(),
    resetForm: jest.fn(),
    addTransaction: jest.fn().mockImplementation((tx) => `tx-${Date.now()}`),
    updateTransaction: jest.fn(),
    bridgeTokens: jest.fn().mockResolvedValue(undefined),
    transactionDetails: {
      exchangeRate: 1,
      feePercentage: '0.10',
      estimatedTime: 300,
      amountOut: '0.0999',
      amountOutUsd: '149.85',
    },
  };
  
  return {
    ...defaultContext,
    ...overrides,
    state: {
      ...defaultContext.state,
      ...(overrides.state || {}),
    },
  };
}
