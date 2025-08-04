'use client';

import { useAccount } from 'wagmi';
import { useAppContext } from '@/contexts/app-context';
import { TransactionStatus } from '@/components/bridge/TransactionStatus';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  const { address, isConnected } = useAccount();
  const { state } = useAppContext();
  const { transactions } = state;

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to view your transaction history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">
            View your bridge transaction history
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/bridge">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bridge
          </Link>
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-lg">
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No transactions yet</h3>
            <p className="text-sm text-muted-foreground">
              Your bridge transactions will appear here once you make them.
            </p>
            <Button asChild className="mt-4">
              <Link href="/bridge">Bridge Tokens</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-5">Transaction</div>
              <div className="col-span-2">From</div>
              <div className="col-span-2">To</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1">Status</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="border rounded-lg overflow-hidden">
                <TransactionStatus transaction={tx} />
              </div>
            ))}
          </div>
          
          {transactions.length > 50 && (
            <div className="flex justify-center pt-4">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
