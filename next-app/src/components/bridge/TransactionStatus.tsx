'use client';

import { useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BridgeTransaction } from '@/types';

type TransactionStatusProps = {
  transaction: BridgeTransaction;
  className?: string;
};

export function TransactionStatus({ transaction, className }: TransactionStatusProps) {
  const { status, fromChain, toChain, fromToken, toToken, amount, txHash, completedAt, error } = transaction;
  
  const statusInfo = useMemo(() => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: 'Transaction Pending',
          description: 'Your transaction is being processed on the blockchain.',
          progress: 30,
          color: 'bg-yellow-500',
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          title: 'Bridge Completed',
          description: 'Your tokens have been successfully bridged!',
          progress: 100,
          color: 'bg-green-500',
        };
      case 'failed':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          title: 'Bridge Failed',
          description: error || 'There was an error processing your transaction.',
          progress: 100,
          color: 'bg-red-500',
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
          title: 'Unknown Status',
          description: 'Unable to determine transaction status.',
          progress: 0,
          color: 'bg-muted-foreground',
        };
    }
  }, [status, error]);
  
  const formattedAmount = useMemo(() => {
    if (!fromToken || !amount) return '';
    return `${parseFloat(amount).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    })} ${fromToken.symbol}`;
  }, [fromToken, amount]);
  
  const formattedTime = useMemo(() => {
    const timestamp = completedAt ? completedAt * 1000 : Date.now();
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  }, [completedAt]);
  
  const explorerUrl = useMemo(() => {
    if (!txHash) return null;
    const baseUrl = fromChain?.explorerUrl || 'https://etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
  }, [txHash, fromChain]);
  
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {status === 'pending' ? (
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                  </div>
                </div>
              ) : status === 'completed' ? (
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">{statusInfo.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formattedTime}
              </p>
            </div>
          </div>
          {explorerUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(explorerUrl, '_blank')}
              title="View on Explorer"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">View on Explorer</span>
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{formattedAmount}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">{fromChain?.name || 'Unknown'}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium">{toChain?.name || 'Unknown'}</span>
          </div>
          
          {status === 'pending' && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Bridging in progress</span>
                <span>{statusInfo.progress}%</span>
              </div>
              <Progress value={statusInfo.progress} className="h-2" />
            </div>
          )}
          
          {status === 'failed' && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{statusInfo.description}</p>
            </div>
          )}
          
          {status === 'completed' && toToken && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">You received</span>
              <span className="font-medium">
                {parseFloat(amount).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}{' '}
                {toToken.symbol}
              </span>
            </div>
          )}
        </div>
        
        {status === 'failed' && (
          <Button variant="outline" className="w-full mt-2" size="sm">
            Retry Bridge
          </Button>
        )}
      </div>
      
      {status === 'pending' && (
        <div className="bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between">
          <span>Estimated completion: ~5-10 minutes</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            View Details
          </Button>
        </div>
      )}
    </div>
  );
}
