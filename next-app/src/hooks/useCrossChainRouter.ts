import { useCallback, useEffect } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { CrossChainRouter } from '@/contracts';
import { formatError } from '@/lib/utils';
import { useAppContext } from '@/contexts/app-context';
import { useToast } from '@/components/ui/use-toast';

export function useCrossChainRouter() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { setTransactionStatus } = useAppContext();
  const { toast } = useToast();

  // Get the contract instance
  const getContract = useCallback(() => {
    if (!walletClient || !chainId) return null;
    
    const chainConfig = {
      address: process.env.NEXT_PUBLIC_ROUTER_ADDRESS as `0x${string}`,
      abi: CrossChainRouter.abi,
    };
    
    return {
      address: chainConfig.address,
      abi: chainConfig.abi,
    };
  }, [walletClient, chainId]);

  // Bridge tokens
  const bridgeTokens = useCallback(async (
    fromChainId: number,
    toChainId: number,
    tokenAddress: string,
    amount: string,
    recipient: string,
    slippage: number = 0.5 // 0.5% default slippage
  ) => {
    if (!walletClient || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return null;
    }

    setTransactionStatus('preparing');

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not initialized');

      // For native token, we need to send value with the transaction
      const isNativeToken = tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const value = isNativeToken ? BigInt(amount) : 0n;

      // Prepare the transaction
      const request = await publicClient.simulateContract({
        ...contract,
        functionName: 'bridge',
        args: [
          fromChainId,
          toChainId,
          tokenAddress,
          BigInt(amount),
          recipient,
          Math.floor(slippage * 100), // Convert to basis points
        ],
        value,
        account: address,
      });

      // Send the transaction
      const hash = await walletClient.writeContract({
        ...request.request,
        gas: request.request.gas,
      });

      setTransactionStatus('pending');
      
      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        setTransactionStatus('completed');
        toast({
          title: 'Success',
          description: 'Bridge transaction completed successfully',
          variant: 'success',
        });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Bridge error:', error);
      setTransactionStatus('error');
      toast({
        title: 'Transaction Error',
        description: formatError(error),
        variant: 'destructive',
      });
      return null;
    }
  }, [walletClient, address, getContract, publicClient, setTransactionStatus, toast]);

  // Get supported tokens for a chain
  const getSupportedTokens = useCallback(async (chainId: number) => {
    const contract = getContract();
    if (!contract) return [];

    try {
      const tokens = await publicClient.readContract({
        ...contract,
        functionName: 'getSupportedTokens',
        args: [chainId],
      });
      return tokens as string[];
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      return [];
    }
  }, [getContract, publicClient]);

  // Get bridge status for a transaction
  const getBridgeStatus = useCallback(async (txHash: string) => {
    const contract = getContract();
    if (!contract) return null;

    try {
      const status = await publicClient.readContract({
        ...contract,
        functionName: 'getBridgeStatus',
        args: [txHash],
      });
      return status;
    } catch (error) {
      console.error('Error fetching bridge status:', error);
      return null;
    }
  }, [getContract, publicClient]);

  // Check if a token is supported on a chain
  const isTokenSupported = useCallback(async (chainId: number, tokenAddress: string) => {
    const contract = getContract();
    if (!contract) return false;

    try {
      const isSupported = await publicClient.readContract({
        ...contract,
        functionName: 'isTokenSupported',
        args: [chainId, tokenAddress],
      });
      return isSupported as boolean;
    } catch (error) {
      console.error('Error checking token support:', error);
      return false;
    }
  }, [getContract, publicClient]);

  // Get bridge fee for a token transfer
  const getBridgeFee = useCallback(async (
    fromChainId: number,
    toChainId: number,
    tokenAddress: string,
    amount: string
  ) => {
    const contract = getContract();
    if (!contract) return '0';

    try {
      const fee = await publicClient.readContract({
        ...contract,
        functionName: 'calculateBridgeFee',
        args: [fromChainId, toChainId, tokenAddress, BigInt(amount)],
      });
      return fee.toString();
    } catch (error) {
      console.error('Error calculating bridge fee:', error);
      return '0';
    }
  }, [getContract, publicClient]);

  return {
    bridgeTokens,
    getSupportedTokens,
    getBridgeStatus,
    isTokenSupported,
    getBridgeFee,
  };
}
