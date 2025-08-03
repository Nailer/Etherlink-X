import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, optimism, arbitrum } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Configure chains & providers
const config = createConfig(
  getDefaultConfig({
    appName: 'Etherlink-X',
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace with your WalletConnect project ID
    chains: [mainnet, sepolia, optimism, arbitrum],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [optimism.id]: http(),
      [arbitrum.id]: http(),
    },
    ssr: true, // If your app uses SSR
  })
);

// Create a client for React Query
const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#4F46E5',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'rounded',
            overlayBlur: 'small',
          })}
          options={{
            initialChainId: 0, // Default to the first chain in the config
            hideBalance: false,
            hideTooltips: false,
            hideNoWalletCTA: false,
            hideQuestionMarkCTA: false,
            walletConnectCTA: 'link',
            walletConnectName: 'WalletConnect',
            embedGoogleFonts: true,
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3Provider;
