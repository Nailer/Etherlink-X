import { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWeb3 } from '@/hooks/useWeb3';
import { formatAddress } from '@/utils/format';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { address, isConnected, disconnect } = useWeb3();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary dark:text-primary-300">
                  Etherlink<span className="text-secondary dark:text-secondary-300">X</span>
                </h1>
              </div>
              <nav className="hidden md:ml-10 md:flex space-x-8">
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-300 px-3 py-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-300 px-3 py-2 text-sm font-medium">
                  Bridge
                </a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-300 px-3 py-2 text-sm font-medium">
                  Vaults
                </a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-300 px-3 py-2 text-sm font-medium">
                  Analytics
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ConnectButton 
                  accountStatus="address"
                  showBalance={false}
                  chainStatus="icon"
                />
              </div>
              {isConnected && address && (
                <button
                  onClick={() => disconnect()}
                  className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Etherlink-X. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
