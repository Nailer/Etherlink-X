import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BridgeStatus, type BridgeTransaction } from '@/types';
import { getExplorerUrl } from '@/utils/contracts';

interface TransactionStatusProps {
  transaction: BridgeTransaction;
  className?: string;
}

const STATUS_CONFIG = {
  [BridgeStatus.PENDING]: {
    text: 'Pending',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  [BridgeStatus.CONFIRMING]: {
    text: 'Confirming',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: (
      <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ),
  },
  [BridgeStatus.CONFIRMED]: {
    text: 'Confirmed',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  [BridgeStatus.EXECUTING]: {
    text: 'Bridging',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: (
      <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
  [BridgeStatus.COMPLETED]: {
    text: 'Completed',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  [BridgeStatus.FAILED]: {
    text: 'Failed',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  [BridgeStatus.REFUNDED]: {
    text: 'Refunded',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
} as const;

export function TransactionStatus({ transaction, className = '' }: TransactionStatusProps) {
  const [timeAgo, setTimeAgo] = useState('');
  const statusConfig = STATUS_CONFIG[transaction.status] || STATUS_CONFIG[BridgeStatus.PENDING];
  
  // Update time ago every minute
  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true }));
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [transaction.timestamp]);
  
  const explorerUrl = getExplorerUrl(transaction.fromChainId, 'tx', transaction.txHash);
  
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${statusConfig.bgColor} ${statusConfig.color} mr-3`}>
              {statusConfig.icon}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {transaction.amount} {transaction.fromToken} → {transaction.toToken}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {statusConfig.text} • {timeAgo}
              </div>
            </div>
          </div>
          
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        
        {transaction.steps && transaction.steps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="space-y-3">
              {transaction.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center">
                    {index === transaction.currentStep ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary-500"></div>
                    ) : index < transaction.currentStep ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {step.type === 'bridge' 
                        ? `Bridge ${step.amountIn} ${step.fromToken} to ${step.toChainId === transaction.toChainId ? 'Destination' : 'Bridge'}`
                        : step.type === 'swap'
                        ? `Swap ${step.amountIn} ${step.fromToken} to ${step.amountOut} ${step.toToken}`
                        : step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {step.protocol} • {step.estimatedTime / 60} min
                      {step.feeAmount && step.feeToken && ` • Fee: ${step.feeAmount} ${step.feeToken}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {transaction.error && (
          <div className="mt-3 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md">
            {transaction.error}
          </div>
        )}
      </div>
      
      {transaction.receipt && transaction.receipt.status === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 text-sm text-green-700 dark:text-green-400 border-t border-green-100 dark:border-green-900/30">
          Transaction confirmed
        </div>
      )}
      
      {transaction.receipt && transaction.receipt.status === 'failed' && (
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-700 dark:text-red-400 border-t border-red-100 dark:border-red-900/30">
          Transaction failed
        </div>
      )}
    </div>
  );
}

export default TransactionStatus;
