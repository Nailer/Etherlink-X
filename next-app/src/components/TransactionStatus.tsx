'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Check, Clock, AlertTriangle, ArrowRight, ExternalLink, X } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function TransactionStatus() {
  const { state, resetBridge } = useAppContext();
  const { status, transactions } = state;
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  // Get the latest transaction
  const latestTransaction = transactions[0];
  
  // Update progress based on status
  useEffect(() => {
    let newProgress = 0;
    
    switch (status) {
      case 'approving':
        newProgress = 25;
        break;
      case 'bridging':
        newProgress = 60;
        break;
      case 'completed':
        newProgress = 100;
        break;
      case 'failed':
        newProgress = 0;
        break;
      default:
        newProgress = 0;
    }
    
    setProgress(newProgress);
  }, [status]);
  
  // Auto-hide completed transactions after delay
  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => {
        resetBridge();
      }, 10000); // Hide after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [status, resetBridge]);
  
  if (!latestTransaction || status === 'idle') {
    return null;
  }
  
  const { fromToken, toToken, amount, txHash, status: txStatus } = latestTransaction;
  const isCompleted = txStatus === 'completed';
  const isFailed = txStatus === 'failed';
  const isInProgress = !isCompleted && !isFailed;
  
  // Get explorer URL based on chain
  const getExplorerUrl = (chainId: number, hash: string) => {
    // This is a simplified example - in a real app, you'd have a mapping of chain IDs to explorer URLs
    const explorers: Record<number, string> = {
      1: `https://etherscan.io/tx/${hash}`,
      42161: `https://arbiscan.io/tx/${hash}`,
      10: `https://optimistic.etherscan.io/tx/${hash}`,
      137: `https://polygonscan.com/tx/${hash}`,
      56: `https://bscscan.com/tx/${hash}`,
    };
    
    return explorers[chainId] || `#`;
  };
  
  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isCompleted ? 'Bridge Complete' : isFailed ? 'Bridge Failed' : 'Bridging in Progress'}
          </h3>
          <button 
            onClick={resetBridge}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Status: {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'In Progress'}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Transaction details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center',
                  isCompleted ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-blue-500'
                )}>
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : isFailed ? (
                    <AlertTriangle className="h-4 w-4 text-white" />
                  ) : (
                    <Clock className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium">
                  {amount} {fromToken?.symbol}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(latestTransaction.timestamp), { addSuffix: true })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {isCompleted ? latestTransaction.amountOut || amount : '...'} {toToken?.symbol}
              </div>
              <div className="text-sm text-gray-500">
                {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Processing'}
              </div>
            </div>
          </div>
          
          {/* Transaction hash and link */}
          {txHash && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500 truncate mr-2">
                Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </div>
              <a
                href={getExplorerUrl(latestTransaction.fromChain, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
              >
                View on Explorer
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            </div>
          )}
        </div>
        
        {/* Error message if failed */}
        {isFailed && latestTransaction.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{latestTransaction.error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={resetBridge}
          >
            {isCompleted ? 'Close' : 'Cancel'}
          </Button>
          
          {isCompleted ? (
            <Button 
              className="flex-1"
              onClick={() => {
                // TODO: Add to portfolio or view in portfolio
              }}
            >
              View in Portfolio
            </Button>
          ) : isFailed ? (
            <Button 
              className="flex-1"
              onClick={() => {
                // TODO: Retry logic
              }}
            >
              Try Again
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </Button>
          )}
        </div>
        
        {/* Detailed transaction info */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Transaction Details</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">From Chain</span>
                <span className="font-medium">
                  {fromToken?.chainId === 1 ? 'Ethereum' : 
                   fromToken?.chainId === 42161 ? 'Arbitrum' : 
                   fromToken?.chainId === 10 ? 'Optimism' : 
                   fromToken?.chainId === 137 ? 'Polygon' : 
                   fromToken?.chainId === 56 ? 'BNB Chain' : 
                   `Chain ${fromToken?.chainId}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">To Chain</span>
                <span className="font-medium">
                  {toToken?.chainId === 1 ? 'Ethereum' : 
                   toToken?.chainId === 42161 ? 'Arbitrum' : 
                   toToken?.chainId === 10 ? 'Optimism' : 
                   toToken?.chainId === 137 ? 'Polygon' : 
                   toToken?.chainId === 56 ? 'BNB Chain' : 
                   `Chain ${toToken?.chainId}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">
                  {amount} {fromToken?.symbol}
                </span>
              </div>
              
              {latestTransaction.fee && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Bridge Fee</span>
                  <span className="font-medium">
                    {latestTransaction.fee} {latestTransaction.feeToken?.symbol}
                  </span>
                </div>
              )}
              
              {latestTransaction.estimatedTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Time</span>
                  <span className="font-medium">
                    ~{Math.ceil(latestTransaction.estimatedTime / 60)} minutes
                  </span>
                </div>
              )}
              
              {latestTransaction.txHash && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Transaction</span>
                  <a
                    href={getExplorerUrl(latestTransaction.fromChain, latestTransaction.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium flex items-center text-sm"
                  >
                    View on Explorer
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
