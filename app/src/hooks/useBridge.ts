import { useState, useCallback } from 'react';
import { parseEther, formatEther } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useWeb3 } from './useWeb3';
import { useApp } from '@/contexts/AppContext';
import { getCrossChainRouterContract, getERC20Contract } from '@/utils/contracts';
import { CHAIN_IDS } from '@/config/web3';
import { BridgeStatus } from '@/types';

export function useBridge() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchNetwork } = useWeb3();
  const { state, updateTransaction } = useApp();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Get the best route for a bridge transaction
   */
  const getBestRoute = useCallback(async (
    fromChainId: number,
    toChainId: number,
    token: string,
    amount: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would query an API or smart contract to find the best route
      // For now, we'll return a mock route
      return {
        fromChainId,
        toChainId,
        fromToken: token,
        toToken: token,
        amountIn: amount,
        amountOut: (parseFloat(amount) * 0.999).toString(), // 0.1% fee
        feeAmount: (parseFloat(amount) * 0.001).toString(),
        feeToken: token,
        estimatedTime: 300, // 5 minutes
        steps: [
          {
            type: 'bridge',
            protocol: 'Etherlink-X',
            fromChainId,
            toChainId,
            fromToken: token,
            toToken: token,
            amountIn: amount,
            amountOut: (parseFloat(amount) * 0.999).toString(),
            feeAmount: (parseFloat(amount) * 0.001).toString(),
            feeToken: token,
            estimatedTime: 300,
          },
        ],
      };
    } catch (err) {
      console.error('Error getting best route:', err);
      setError('Failed to find a route. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Execute a bridge transaction
   */
  const executeBridge = useCallback(async (
    txId: string,
    fromChainId: number,
    toChainId: number,
    token: string,
    amount: string,
    recipient: string
  ) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Update transaction status to confirming
      updateTransaction(txId, { status: BridgeStatus.CONFIRMING });
      
      // Get the CrossChainRouter contract
      const router = getCrossChainRouterContract(publicClient, walletClient);
      
      // Convert amount to wei
      const amountWei = parseEther(amount);
      
      // Check if we need to approve the token first
      if (token !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') { // Not native token
        const tokenContract = getERC20Contract(token as `0x${string}`, publicClient, walletClient);
        
        // Check allowance
        const allowance = await tokenContract.read.allowance([address, router.address]);
        
        if (allowance < amountWei) {
          // Need to approve
          updateTransaction(txId, { 
            status: BridgeStatus.CONFIRMING,
            steps: [
              {
                type: 'approve',
                protocol: 'ERC20',
                fromChainId,
                toChainId: fromChainId,
                fromToken: token,
                toToken: token,
                amountIn: amount,
                amountOut: amount,
                feeAmount: '0',
                feeToken: token,
                estimatedTime: 30,
              },
            ],
            currentStep: 0,
          });
          
          // Send approve transaction
          const approveHash = await tokenContract.write.approve([
            router.address, 
            amountWei
          ]);
          
          // Wait for confirmation
          await publicClient.waitForTransactionReceipt({
            hash: approveHash,
          });
          
          // Update transaction status
          updateTransaction(txId, { 
            status: BridgeStatus.CONFIRMING,
            steps: [
              {
                type: 'approve',
                protocol: 'ERC20',
                fromChainId,
                toChainId: fromChainId,
                fromToken: token,
                toToken: token,
                amountIn: amount,
                amountOut: amount,
                feeAmount: '0',
                feeToken: token,
                estimatedTime: 0,
                completed: true,
              },
              {
                type: 'bridge',
                protocol: 'Etherlink-X',
                fromChainId,
                toChainId,
                fromToken: token,
                toToken: token,
                amountIn: amount,
                amountOut: (parseFloat(amount) * 0.999).toString(),
                feeAmount: (parseFloat(amount) * 0.001).toString(),
                feeToken: token,
                estimatedTime: 300,
              },
            ],
            currentStep: 1,
          });
        }
      }
      
      // Get the best route (in a real app, this would be calculated based on liquidity, fees, etc.)
      const route = await getBestRoute(fromChainId, toChainId, token, amount);
      
      if (!route) {
        throw new Error('No route found');
      }
      
      // Update transaction with route details
      updateTransaction(txId, { 
        steps: route.steps,
        currentStep: 0,
      });
      
      // Prepare the bridge parameters
      const bridgeParams = {
        fromChainId,
        toChainId,
        token: token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' 
          ? '0x0000000000000000000000000000000000000000' // Zero address for native token
          : token,
        amount: amountWei,
        recipient,
        adapters: [
          '0x0000000000000000000000000000000000000001' // Mock adapter address
        ],
        adapterParams: [
          '0x' // Mock adapter params
        ],
      };
      
      // Send the bridge transaction
      updateTransaction(txId, { 
        status: BridgeStatus.CONFIRMING,
      });
      
      // In a real app, this would call the CrossChainRouter contract
      // For now, we'll simulate the transaction
      const txHash = `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`;
      
      // Simulate waiting for confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update transaction with receipt
      updateTransaction(txId, { 
        txHash,
        status: BridgeStatus.CONFIRMED,
        receipt: {
          transactionHash: txHash,
          from: address,
          to: router.address,
          status: 'success',
          blockNumber: Math.floor(Math.random() * 10000000),
          timestamp: Math.floor(Date.now() / 1000),
          gasUsed: BigInt(21000),
          gasPrice: await publicClient.getGasPrice(),
          chainId: fromChainId,
        },
      });
      
      // Simulate bridge execution
      updateTransaction(txId, { 
        status: BridgeStatus.EXECUTING,
        currentStep: 1,
      });
      
      // Simulate bridge completion
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      updateTransaction(txId, { 
        status: BridgeStatus.COMPLETED,
        currentStep: 2,
      });
      
      return txHash;
    } catch (err) {
      console.error('Bridge error:', err);
      
      // Update transaction with error
      updateTransaction(txId, { 
        status: BridgeStatus.FAILED,
        error: err instanceof Error ? err.message : 'Transaction failed',
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, publicClient, getBestRoute, updateTransaction]);
  
  return {
    getBestRoute,
    executeBridge,
    isLoading,
    error,
  };
}

export default useBridge;
