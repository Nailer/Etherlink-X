import { useApp } from '@/contexts/AppContext';

interface SwapArrowsButtonProps {
  className?: string;
  disabled?: boolean;
}

export function SwapArrowsButton({ className = '', disabled = false }: SwapArrowsButtonProps) {
  const { switchChains } = useApp();
  
  return (
    <div className={`flex justify-center my-1 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            switchChains();
          }
        }}
        disabled={disabled}
        className={`p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700 dark:hover:text-gray-200'}`}
        aria-label="Switch source and destination chains"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M15.707 4.293a1 1 0 010 1.414L12.414 9H16a1 1 0 110 2H9a1 1 0 01-1-1V4a1 1 0 112 0v3.586l3.293-3.293a1 1 0 011.414 0zM4.293 15.707a1 1 0 010-1.414L7.586 11H4a1 1 0 110-2h7a1 1 0 011 1v7a1 1 0 11-2 0v-3.586l-3.293 3.293a1 1 0 01-1.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
    </div>
  );
}

export default SwapArrowsButton;
