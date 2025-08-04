import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { useAppContext } from '@/contexts/app-context';
import { useTokenAllowance } from './useTokenAllowance';
import { useTokenBalance } from './useTokenBalance';
import { useToast } from '@/components/ui/use-toast';
import { CrossChainRouter } from '@/contracts/CrossChainRouter';

export function useBridge() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  
  const { fromChain, toChain, fromToken, toToken, amount, recipient, slippage } = state;

  // Check token allowance
  const { data: allowance = '0', refetch: refetchAllowance } = useTokenAllowance({
    token: fromToken,
    owner: address as `0x${string}`,
    spender: CrossChainRouter.address,
    chainId: fromChain?.id,
    enabled: !!fromToken && 
             !!address && 
             !!fromChain && 
             fromToken.address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Not needed for native tokens
  });

  // Check token balance
  const { refetch: refetchBalance } = useTokenBalance({
    token: fromToken,
    address: address as `0x${string}`,
    chainId: fromChain?.id,
    enabled: !!fromToken && !!address && !!fromChain,
  });

  // Check if approval is needed
  const needsApproval = useCallback(() => {
    if (!fromToken || !amount) return false;
    
    // Native tokens don't need approval
    if (fromToken.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      return false;
    }
    
    const amountWei = parseUnits(amount, fromToken.decimals);
    const allowanceWei = parseUnits(allowance || '0', fromToken.decimals);
    
    return amountWei > allowanceWei;
  }, [fromToken, amount, allowance]);

  // Approve token spending
  const approveToken = useCallback(async () => {
    if (!fromToken || !walletClient || !address || !fromChain) {
      throw new Error('Missing required parameters for token approval');
    }

    try {
      // For native tokens, no approval needed
      if (fromToken.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        return true;
      }

      const amountWei = parseUnits(amount || '0', fromToken.decimals);
      
      // Simulate the approval transaction
      const { request } = await publicClient.simulateContract({
        address: fromToken.address as `0x${string}`,
        abi: [
          {
            constant: false,
            inputs: [
              { name: '_spender', type: 'address' },
              { name: '_value', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'approve',
        args: [CrossChainRouter.address, amountWei],
        account: address,
      });
      
      // Send the approval transaction
      const hash = await walletClient.writeContract(request);
      
      // Wait for the transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh allowance and balance
      await Promise.all([refetchAllowance(), refetchBalance()]);
      
      toast({
        title: 'Approval successful',
        description: 'Your tokens have been approved for bridging',
      });
      
      return true;
    } catch (error) {
      console.error('Approval error:', error);
      
      let errorMessage = 'Failed to approve token spending';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: 'Approval failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [fromToken, walletClient, address, fromChain, amount, publicClient, refetchAllowance, refetchBalance, toast]);

  // Execute bridge transaction
  const bridgeTokens = useCallback(async () => {
    if (!fromChain || !toChain || !fromToken || !toToken || !amount || !walletClient || !address) {
      throw new Error('Missing required parameters for bridge transaction');
    }

    try {
      const recipientAddress = recipient || address;
      const amountWei = parseUnits(amount, fromToken.decimals);
      const slippageBps = Math.floor(slippage * 100); // Convert percentage to basis points
      
      // For native token transfers, include value in the transaction
      const value = fromToken.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' 
        ? amountWei 
        : undefined;
      
      // Simulate the bridge transaction
      const { request } = await publicClient.simulateContract({
        ...CrossChainRouter,
        functionName: 'bridge',
        args: [
          fromChain.id,
          toChain.id,
          fromToken.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' 
            ? '0x0000000000000000000000000000000000000000' // Zero address for native token
            : fromToken.address,
          amountWei,
          recipientAddress,
          slippageBps,
        ],
        account: address,
        value,
      });
      
      // Send the bridge transaction
      const hash = await walletClient.writeContract(request);
      
      // Create a transaction object for the UI
      const tx = {
        id: `tx-${Date.now()}`,
        fromChain: fromChain.id,
        toChain: toChain.id,
        fromToken,
        toToken,
        amount,
        recipient: recipientAddress,
        status: 'pending' as const,
        timestamp: Math.floor(Date.now() / 1000),
        txHash: hash,
      };
      
      // Add to transactions list
      dispatch({ type: 'ADD_TRANSACTION', payload: tx });
      
      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Update transaction status
      if (receipt.status === 'success') {
        dispatch({ 
          type: 'UPDATE_TRANSACTION', 
          payload: { 
            id: tx.id, 
            status: 'completed',
            completedAt: Math.floor(Date.now() / 1000),
          } 
        });
        
        toast({
          title: 'Bridge successful',
          description: 'Your tokens have been bridged successfully',
        });
      } else {
        dispatch({ 
          type: 'UPDATE_TRANSACTION', 
          payload: { 
            id: tx.id, 
            status: 'failed',
            error: 'Transaction reverted',
          } 
        });
        
        toast({
          title: 'Bridge failed',
          description: 'Your transaction was reverted',
          variant: 'destructive',
        });
      }
      
      // Refresh balance
      await refetchBalance();
      
      return receipt;
    } catch (error) {
      console.error('Bridge error:', error);
      
      let errorMessage = 'Failed to bridge tokens';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: 'Bridge failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [
    fromChain, 
    toChain, 
    fromToken, 
    toToken, 
    amount, 
    walletClient, 
    address, 
    recipient, 
    slippage, 
    publicClient, 
    dispatch, 
    toast, 
    refetchBalance
  ]);

  return {
    needsApproval,
    approveToken,
    bridgeTokens,
  };
}
