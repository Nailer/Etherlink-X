import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { getDefaultConfig } from 'connectkit';

// List of supported chains
export const supportedChains = [mainnet, sepolia];

// WalletConnect Project ID - replace with your own
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID';

// App metadata for ConnectKit
const appName = 'Etherlink-X';
const appDescription = 'Cross-Chain Bridge';
const appUrl = 'https://etherlink-x.vercel.app';
const appIcon = `${appUrl}/icon-512x512.png`;

// Create wagmi config
export const config = getDefaultConfig({
  appName,
  appDescription,
  appUrl,
  appIcon,
  chains: supportedChains,
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
  },
  ssr: true,
  walletConnectProjectId: projectId,
});

// Export the config for wagmi
export default createConfig({
  ...config,
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName,
      appLogoUrl: appIcon,
    }),
    walletConnect({
      projectId,
      metadata: {
        name: appName,
        description: appDescription,
        url: appUrl,
        icons: [appIcon],
      },
    }),
  ],
});

// Types for our app
declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
