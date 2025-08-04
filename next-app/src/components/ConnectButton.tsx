'use client';

import { useState } from 'react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { ConnectKitButton } from 'connectkit';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const [showDisconnect, setShowDisconnect] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    setShowDisconnect(false);
  };

  if (!isConnected) {
    return (
      <ConnectKitButton.Custom>
        {({ show }) => (
          <button
            onClick={show}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Connect Wallet
          </button>
        )}
      </ConnectKitButton.Custom>
    );
  }

  const displayAddress = ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDisconnect(!showDisconnect)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
        <span className="truncate max-w-[120px]">{displayAddress}</span>
      </button>
      
      {showDisconnect && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleDisconnect}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
