import { renderHook, act } from '@testing-library/react';
import { useBridge } from '../useBridge';
import { TestWrapper, createMockContext } from '@/__tests__/test-utils';
import { AppContext } from '@/contexts/AppContext';
import { BridgeStatus } from '@/types';

// Mock the viem and wagmi hooks
jest.mock('viem', () => ({
  ...jest.requireActual('viem'),
  parseEther: (amount: string) => BigInt(Math.floor(parseFloat(amount) * 1e18)),
  formatEther: (amount: bigint) => (Number(amount) / 1e18).toString(),
}));

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
  usePublicClient: () => ({
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
  useWalletClient: () => ({
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
}));

describe('useBridge', () => {
  const mockContext = createMockContext();
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppContext.Provider value={mockContext}>
      <TestWrapper>{children}</TestWrapper>
    </AppContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBridge(), { wrapper });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('executeBridge', () => {
    it('should execute a bridge transaction successfully', async () => {
      const { result } = renderHook(() => useBridge(), { wrapper });
      
      await act(async () => {
        const txId = await result.current.executeBridge(
          'test-tx-1',
          1, // fromChainId
          10, // toChainId
          'WETH', // token
          '0.1', // amount
          '0x1234567890123456789012345678901234567890' // recipient
        );
        
        expect(txId).toBeDefined();
      });
      
      // Check that the transaction was updated with the correct statuses
      expect(mockContext.updateTransaction).toHaveBeenCalledWith('test-tx-1', {
        status: BridgeStatus.CONFIRMING,
      });
      
      // Should update to completed status
      expect(mockContext.updateTransaction).toHaveBeenLastCalledWith('test-tx-1', {
        status: BridgeStatus.COMPLETED,
        currentStep: 2,
      });
    });
    
    it('should handle ERC20 approval flow', async () => {
      const { result } = renderHook(() => useBridge(), { wrapper });
      
      await act(async () => {
        await result.current.executeBridge(
          'test-tx-2',
          1, // fromChainId
          10, // toChainId
          'USDC', // token (not native)
          '100', // amount
          '0x1234567890123456789012345678901234567890' // recipient
        );
      });
      
      // Should first update with approval step
      expect(mockContext.updateTransaction).toHaveBeenCalledWith('test-tx-2', {
        status: BridgeStatus.CONFIRMING,
        steps: expect.any(Array),
        currentStep: 0,
      });
      
      // Then should proceed with bridge step
      expect(mockContext.updateTransaction).toHaveBeenCalledWith('test-tx-2', {
        status: BridgeStatus.CONFIRMING,
        steps: expect.any(Array),
        currentStep: 1,
      });
    });
    
    it('should handle errors during bridge execution', async () => {
      // Mock a failing transaction
      const error = new Error('Bridge execution failed');
      const failingContext = createMockContext({
        updateTransaction: jest.fn().mockRejectedValueOnce(error),
      });
      
      const { result } = renderHook(() => useBridge(), {
        wrapper: ({ children }) => (
          <AppContext.Provider value={failingContext}>
            <TestWrapper>{children}</TestWrapper>
          </AppContext.Provider>
        ),
      });
      
      await expect(
        act(async () => {
          await result.current.executeBridge(
            'test-tx-3',
            1, // fromChainId
            10, // toChainId
            'WETH', // token
            '0.1', // amount
            '0x1234567890123456789012345678901234567890' // recipient
          );
        })
      ).rejects.toThrow('Bridge execution failed');
      
      // Should update with error status
      expect(failingContext.updateTransaction).toHaveBeenCalledWith('test-tx-3', {
        status: BridgeStatus.FAILED,
        error: 'Bridge execution failed',
      });
    });
  });
  
  describe('getBestRoute', () => {
    it('should return the best route for a bridge transaction', async () => {
      const { result } = renderHook(() => useBridge(), { wrapper });
      
      const route = await result.current.getBestRoute(
        1, // fromChainId
        10, // toChainId
        'WETH', // token
        '0.1' // amount
      );
      
      expect(route).toEqual({
        fromChainId: 1,
        toChainId: 10,
        fromToken: 'WETH',
        toToken: 'WETH',
        amountIn: '0.1',
        amountOut: expect.any(String),
        feeAmount: expect.any(String),
        feeToken: 'WETH',
        estimatedTime: 300,
        steps: expect.any(Array),
      });
    });
    
    it('should handle errors when getting the best route', async () => {
      const { result } = renderHook(() => useBridge(), { wrapper });
      
      // Test with invalid amount
      const route = await result.current.getBestRoute(1, 10, 'WETH', 'invalid');
      expect(route).toBeNull();
      
      // Test with zero amount
      const route2 = await result.current.getBestRoute(1, 10, 'WETH', '0');
      expect(route2).toBeNull();
    });
  });
});
