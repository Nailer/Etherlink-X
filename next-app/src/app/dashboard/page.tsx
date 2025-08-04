'use client';

import { useState } from 'react';
import Head from 'next/head';
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from 'wagmi';
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { AppProvider } from '@/contexts/AppContext';
import { BridgeForm } from '@/components/BridgeForm';
import { TransactionStatus } from '@/components/TransactionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatAddress, formatTokenAmount } from '@/lib/utils';

// Mock data - replace with real data from your API
const mockPortfolio = {
  totalValue: 12543.89,
  chains: [
    { id: 1, name: 'Ethereum', value: 8543.21, change: 2.5 },
    { id: 2, name: 'Arbitrum', value: 2500.0, change: -1.2 },
    { id: 3, name: 'Optimism', value: 1500.67, change: 0.8 },
  ],
  assets: [
    { symbol: 'ETH', balance: 2.5, value: 7500, chain: 'Ethereum' },
    { symbol: 'USDC', balance: 5000, value: 5000, chain: 'Arbitrum' },
    { symbol: 'USDT', balance: 1000, value: 1000, chain: 'Optimism' },
  ],
};

const mockTransactions = [
  { id: 1, type: 'send', amount: '0.5', token: 'ETH', from: 'Ethereum', to: 'Arbitrum', status: 'completed', date: '2023-06-15T14:30:00Z' },
  { id: 2, type: 'receive', amount: '500', token: 'USDC', from: 'Arbitrum', to: 'Ethereum', status: 'pending', date: '2023-06-14T09:15:00Z' },
  { id: 3, type: 'send', amount: '1.2', token: 'ETH', from: 'Ethereum', to: 'Optimism', status: 'completed', date: '2023-06-12T16:45:00Z' },
];

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { data: ethBalance } = useBalance({
    address,
    watch: true,
  });
  
  const [activeTab, setActiveTab] = useState('bridge');

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access the Etherlink-X dashboard and start bridging assets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <w3m-button />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Head>
          <title>Dashboard | Etherlink-X</title>
          <meta name="description" content="Your cross-chain DeFi dashboard on Etherlink" />
        </Head>

        <div className="container mx-auto px-4 py-8">
          {/* Portfolio Overview */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockPortfolio.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+2.3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ethereum Balance</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ethBalance ? formatTokenAmount(ethBalance.value, ethBalance.decimals, 4) : '0.0'} {ethBalance?.symbol}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${(parseFloat(ethBalance?.formatted || '0') * 3000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chains</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPortfolio.chains.length}</div>
                <p className="text-xs text-muted-foreground">
                  {mockPortfolio.chains.map(c => c.name).join(', ')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Wallet</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {address ? formatAddress(address) : 'Not connected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {chain?.name || 'No network'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Bridge Form */}
            <div className="md:col-span-2 space-y-6">
              <Tabs defaultValue="bridge" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bridge">Bridge</TabsTrigger>
                  <TabsTrigger value="swap">Swap</TabsTrigger>
                </TabsList>
                <TabsContent value="bridge" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cross-Chain Bridge</CardTitle>
                      <CardDescription>
                        Transfer tokens between different blockchains in seconds
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BridgeForm />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="swap" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Swap Tokens</CardTitle>
                      <CardDescription>
                        Swap tokens at the best rates across multiple DEXs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>Your most recent cross-chain transactions</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            tx.type === 'send' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {tx.type === 'send' ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {tx.type === 'send' ? 'Sent' : 'Received'} {tx.amount} {tx.token}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {tx.from} → {tx.to}
                          </p>
                          <div className="flex items-center justify-end space-x-1">
                            {tx.status === 'pending' && <Clock className="h-3 w-3 text-yellow-500" />}
                            <span className={`text-xs ${
                              tx.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Assets</CardTitle>
                  <CardDescription>Tokens across all your connected chains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPortfolio.assets.map((asset) => (
                      <div key={`${asset.symbol}-${asset.chain}`} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">{asset.symbol[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{asset.symbol}</p>
                            <p className="text-xs text-muted-foreground">{asset.chain}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{asset.balance}</p>
                          <p className="text-xs text-muted-foreground">${asset.value.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4">
                      View All Assets
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                    Add Funds
                    <ArrowDownLeft className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Withdraw
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Bridge History
                    <Clock className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    View on Explorer
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppProvider>
  );
}
