import '@testing-library/jest-dom';

// Mock window.ethereum
const mockEthereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  // Add other ethereum methods as needed
};

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true,
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the Web3 provider
jest.mock('wagmi', () => {
  const originalModule = jest.requireActual('wagmi');
  return {
    ...originalModule,
    useAccount: jest.fn().mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      connector: { id: 'mock' },
    }),
    useNetwork: jest.fn().mockReturnValue({
      chain: { id: 1, name: 'Ethereum' },
    }),
    useConnect: jest.fn().mockReturnValue({
      connectors: [],
      connectAsync: jest.fn(),
    }),
    useDisconnect: jest.fn().mockReturnValue({
      disconnect: jest.fn(),
    }),
    useSwitchChain: jest.fn().mockReturnValue({
      switchChain: jest.fn(),
    }),
    usePublicClient: jest.fn().mockReturnValue({
      getGasPrice: jest.fn().mockResolvedValue(BigInt(20000000000)), // 20 Gwei
      waitForTransactionReceipt: jest.fn().mockResolvedValue({
        status: 'success',
        transactionHash: '0x123',
        from: '0x1234567890123456789012345678901234567890',
        to: '0xCrossChainRouterAddress',
        blockNumber: 12345678n,
        gasUsed: 21000n,
        logs: [],
      }),
    }),
    useWalletClient: jest.fn().mockReturnValue({
      data: {
        account: {
          address: '0x1234567890123456789012345678901234567890',
        },
        chain: {
          id: 1,
        },
        writeContract: jest.fn().mockResolvedValue('0x123'),
      },
    }),
  };
});

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock the viem library
jest.mock('viem', () => {
  const originalModule = jest.requireActual('viem');
  return {
    ...originalModule,
    parseEther: (amount: string) => BigInt(Math.floor(parseFloat(amount) * 1e18)),
    formatEther: (amount: bigint) => (Number(amount) / 1e18).toString(),
    createPublicClient: jest.fn().mockReturnValue({
      getGasPrice: jest.fn().mockResolvedValue(BigInt(20000000000)),
      waitForTransactionReceipt: jest.fn().mockResolvedValue({
        status: 'success',
        transactionHash: '0x123',
      }),
    }),
  };
});
