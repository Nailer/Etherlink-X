'use client';

import { useAccount, useNetwork } from 'wagmi';
import { BridgeForm } from '@/components/bridge/BridgeForm';
import { TransactionStatus } from '@/components/bridge/TransactionStatus';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@/components/ConnectButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BridgePage() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const { state } = useAppContext();
  const router = useRouter();

  // Get the most recent transaction
  const recentTransaction = state.transactions[0];

  // Check if the connected chain matches the fromChain in the form
  const isWrongNetwork = chain && state.fromChain && chain.id !== state.fromChain.id;

  // Handle network switch
  const handleSwitchNetwork = () => {
    if (state.fromChain) {
      // In a real app, you would use wagmi's switchNetwork here
      // switchNetwork?.(state.fromChain.id);
      console.log(`Switch to chain ID: ${state.fromChain.id}`);
    }
  };

  // Redirect to home if not connected
  if (isDisconnected && !isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to start bridging tokens
          </p>
        </div>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bridge Tokens</h1>
        <p className="text-muted-foreground">
          Transfer tokens between different blockchains
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-8">
        {/* Network Alert */}
        {isWrongNetwork && state.fromChain && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>
                  Please switch to {state.fromChain.name} to continue
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchNetwork}
                  className="mt-2 sm:mt-0"
                >
                  Switch to {state.fromChain.name}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Bridge Form */}
        <BridgeForm />

        {/* Recent Transaction */}
        {recentTransaction && (
          <div className="space-y-3">
            <h3 className="font-medium">Recent Transaction</h3>
            <TransactionStatus transaction={recentTransaction} />
            
            {state.transactions.length > 1 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/transactions')}
                  className="text-sm"
                >
                  View All Transactions
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mx-auto max-w-3xl mt-12 space-y-6">
        <h2 className="text-xl font-semibold text-center">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-muted/30 p-6 rounded-lg space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
            <h3 className="font-medium">Select Networks</h3>
            <p className="text-sm text-muted-foreground">
              Choose the source and destination blockchains for your transfer.
            </p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
            <h3 className="font-medium">Enter Details</h3>
            <p className="text-sm text-muted-foreground">
              Input the token amount and recipient address (optional).
            </p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
            <h3 className="font-medium">Confirm & Bridge</h3>
            <p className="text-sm text-muted-foreground">
              Review the details and confirm the transaction in your wallet.
            </p>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Bridge transfers typically take 5-30 minutes to complete.</p>
        </div>
      </div>
    </div>
  );
}
