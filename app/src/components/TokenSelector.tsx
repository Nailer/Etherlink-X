import { useState, useCallback, useEffect } from 'react';
import { TokenSymbol } from '@/types';
import { formatTokenAmount } from '@/utils/format';
import { CHAIN_IDS } from '@/config/web3';
import { useApp } from '@/contexts/AppContext';

interface TokenSelectorProps {
  type: 'source' | 'destination';
  onTokenSelect?: (token: TokenSymbol) => void;
  onChainSelect?: (chainId: number) => void;
  disabled?: boolean;
}

// Mock token list - in a real app, this would come from an API or token list
const TOKEN_LIST: { [key in TokenSymbol]: { name: string; symbol: TokenSymbol; logoURI: string; } } = {
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1595348880',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png?1636636734',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1598003707',
  },
};

// Chain data
const CHAIN_DATA = {
  [CHAIN_IDS.MAINNET]: {
    name: 'Ethereum',
    logoURI: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880',
  },
  [CHAIN_IDS.SEPOLIA]: {
    name: 'Sepolia',
    logoURI: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880',
  },
  [CHAIN_IDS.OPTIMISM]: {
    name: 'Optimism',
    logoURI: 'https://assets.coingecko.com/coins/images/25244/thumb/Optimism.png?1660906606',
  },
  [CHAIN_IDS.ARBITRUM]: {
    name: 'Arbitrum',
    logoURI: 'https://assets.coingecko.com/coins/images/16547/thumb/photo_2023-03-29_21.47.16.jpeg?1680097630',
  },
  [CHAIN_IDS.AVALANCHE_FUJI]: {
    name: 'Avalanche Fuji',
    logoURI: 'https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_OnDark.png?1670992784',
  },
};

export function TokenSelector({ type, onTokenSelect, onChainSelect, disabled = false }: TokenSelectorProps) {
  const { state } = useApp();
  const [isTokenMenuOpen, setIsTokenMenuOpen] = useState(false);
  const [isChainMenuOpen, setIsChainMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedChainId = type === 'source' ? state.sourceChainId : state.destinationChainId;
  const selectedToken = state.selectedToken;
  
  // Filter tokens based on search query
  const filteredTokens = Object.entries(TOKEN_LIST).filter(([symbol, token]) => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter out the selected chain from the destination chains
  const availableChains = Object.entries(CHAIN_DATA).filter(([chainId]) => {
    if (type === 'source') return true;
    return parseInt(chainId) !== state.sourceChainId;
  });
  
  const handleTokenSelect = useCallback((token: TokenSymbol) => {
    if (onTokenSelect) {
      onTokenSelect(token);
    }
    setIsTokenMenuOpen(false);
    setSearchQuery('');
  }, [onTokenSelect]);
  
  const handleChainSelect = useCallback((chainId: number) => {
    if (onChainSelect) {
      onChainSelect(chainId);
    }
    setIsChainMenuOpen(false);
  }, [onChainSelect]);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsTokenMenuOpen(false);
      setIsChainMenuOpen(false);
      setSearchQuery('');
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 border ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {type === 'source' ? 'From' : 'To'}
        </span>
        
        <div className="relative">
          <button
            type="button"
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsChainMenuOpen(!isChainMenuOpen);
              setIsTokenMenuOpen(false);
            }}
            disabled={disabled}
          >
            <img 
              src={CHAIN_DATA[selectedChainId as keyof typeof CHAIN_DATA]?.logoURI} 
              alt="" 
              className="w-4 h-4 rounded-full" 
            />
            <span>{CHAIN_DATA[selectedChainId as keyof typeof CHAIN_DATA]?.name}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isChainMenuOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isChainMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Select Network
                </div>
                {availableChains.map(([chainId, chain]) => (
                  <button
                    key={chainId}
                    type="button"
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${parseInt(chainId) === selectedChainId ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    onClick={() => handleChainSelect(parseInt(chainId))}
                  >
                    <img src={chain.logoURI} alt="" className="w-5 h-5 rounded-full mr-2" />
                    <span className="text-left">{chain.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          {selectedToken ? (
            <button
              type="button"
              className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsTokenMenuOpen(!isTokenMenuOpen);
                setIsChainMenuOpen(false);
              }}
              disabled={disabled}
            >
              <img 
                src={TOKEN_LIST[selectedToken]?.logoURI} 
                alt={selectedToken} 
                className="w-6 h-6 rounded-full" 
              />
              <span>{selectedToken}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isTokenMenuOpen ? 'transform rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors border border-dashed border-gray-300 dark:border-gray-600 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                setIsTokenMenuOpen(true);
                setIsChainMenuOpen(false);
              }}
              disabled={disabled}
            >
              Select Token
            </button>
          )}
          
          {isTokenMenuOpen && (
            <div 
              className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search token name or symbol"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map(([symbol, token]) => (
                    <button
                      key={symbol}
                      type="button"
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm ${symbol === selectedToken ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      onClick={() => handleTokenSelect(symbol as TokenSymbol)}
                    >
                      <div className="flex items-center">
                        <img src={token.logoURI} alt="" className="w-6 h-6 rounded-full mr-3" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">{token.symbol}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">0.0</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">$0.00</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">
                    No tokens found
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  onClick={() => {
                    // Handle token import
                    setIsTokenMenuOpen(false);
                  }}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Import Token
                </button>
              </div>
            </div>
          )}
        </div>
        
        {type === 'source' && (
          <div className="ml-4">
            <input
              type="text"
              className="w-full bg-transparent text-2xl font-medium text-right text-gray-900 dark:text-white focus:outline-none"
              placeholder="0.0"
              value={state.amount}
              onChange={(e) => {
                // Allow only numbers and a single decimal point
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  // In a real app, this would update the amount in the app state
                  // For now, we'll just log it
                  console.log('Amount changed:', value);
                  // In a real app: dispatch({ type: 'SET_AMOUNT', payload: value });
                }
              }}
              disabled={!selectedToken || disabled}
            />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              {selectedToken ? `$${(parseFloat(state.amount) * 1.5).toFixed(2)}` : '-'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TokenSelector;
