import { useApp } from '@/contexts/AppContext';
import { useWeb3 } from '@/hooks/useWeb3';

interface BridgeButtonProps {
  className?: string;
}

export function BridgeButton({ className = '' }: BridgeButtonProps) {
  const { state, bridgeTokens } = useApp();
  const { isConnected, address } = useWeb3();
  
  // Determine button state and text
  const getButtonState = () => {
    if (!isConnected || !address) {
      return {
        text: 'Connect Wallet',
        disabled: false,
        onClick: () => {
          // This will be handled by the ConnectButton from RainbowKit
          return;
        },
      };
    }
    
    if (!state.selectedToken) {
      return {
        text: 'Select a Token',
        disabled: true,
      };
    }
    
    if (!state.amount || parseFloat(state.amount) <= 0) {
      return {
        text: 'Enter an Amount',
        disabled: true,
      };
    }
    
    if (state.isBridging) {
      return {
        text: 'Bridging...',
        disabled: true,
      };
    }
    
    if (state.sourceChainId === state.destinationChainId) {
      return {
        text: 'Invalid Route',
        disabled: true,
      };
    }
    
    return {
      text: 'Bridge Now',
      disabled: false,
      onClick: bridgeTokens,
    };
  };
  
  const { text, disabled, onClick } = getButtonState();
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
        disabled
          ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md'
      } ${className}`}
    >
      {text}
    </button>
  );
}

export default BridgeButton;
