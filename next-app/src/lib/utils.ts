import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatUnits, parseUnits } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatCurrency(amount: string | number | bigint, decimals = 2, currency: string = '$'): string {
  let num: number;
  
  if (typeof amount === 'bigint') {
    // Convert bigint to number (be careful with very large numbers)
    num = Number(amount) / 10 ** 18; // Assuming 18 decimals for token amounts
  } else if (typeof amount === 'string') {
    num = parseFloat(amount);
  } else {
    num = amount;
  }
  
  if (isNaN(num)) return `${currency}0`;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    currencyDisplay: 'narrowSymbol',
  }).format(num).replace('$', currency);
}

export function formatTokenAmount(
  amount: string | bigint,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  try {
    let formatted: string;
    
    if (typeof amount === 'bigint') {
      formatted = formatUnits(amount, decimals);
    } else {
      // If it's already a string, ensure it's a valid number
      const num = parseFloat(amount);
      if (isNaN(num)) return '0';
      
      // If it's in wei, format it, otherwise use as is
      formatted = amount.includes('.') ? amount : formatUnits(BigInt(amount), decimals);
    }
    
    // Split into whole and fractional parts
    const [whole, fraction] = formatted.split('.');
    
    if (!fraction || displayDecimals === 0) {
      return whole;
    }
    
    // Truncate the fractional part to displayDecimals
    const truncatedFraction = fraction.slice(0, displayDecimals);
    
    // Only add the decimal part if it's not all zeros
    if (parseInt(truncatedFraction) === 0) {
      return whole;
    }
    
    return `${whole}.${truncatedFraction}`;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
}

export function parseTokenAmount(
  amount: string,
  decimals: number = 18
): bigint {
  try {
    if (!amount) return 0n;
    
    // Remove any commas and trim whitespace
    const cleanAmount = amount.replace(/,/g, '').trim();
    
    // If empty string after cleaning, return 0
    (!cleanAmount) return 0n;
    
    return parseUnits(cleanAmount, decimals);
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return 0n;
  }
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m${remainingSeconds > 0 ? ` ${Math.ceil(remainingSeconds)}s` : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return `${days}d${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
}

export function isAddressEqual(
  address1: string | null | undefined,
  address2: string | null | undefined
): boolean {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
}

export function isZeroAddress(address: string | null | undefined): boolean {
  if (!address) return true;
  return /^0x0+$/i.test(address);
}

export function getExplorerUrl(
  chainId: number,
  type: 'tx' | 'address' | 'block',
  value: string
): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    10: 'https://optimistic.etherscan.io',
    56: 'https://bscscan.com',
    137: 'https://polygonscan.com',
    42161: 'https://arbiscan.io',
    80001: 'https://mumbai.polygonscan.com',
    11155111: 'https://sepolia.etherscan.io',
  };
  
  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  return `${baseUrl}/${type}/${value}`;
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    // Handle common error patterns
    const message = error.message || 'An unknown error occurred';
    
    // Handle JSON-RPC errors
    if (message.includes('execution reverted')) {
      const revertReason = message.split('execution reverted: ')[1] || '';
      return revertReason || 'Transaction reverted';
    }
    
    // Handle user rejected request
    if (message.includes('User rejected the request')) {
      return 'Transaction was rejected';
    }
    
    return message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

// Format a number with commas and optional decimal places
export function formatNumber(
  value: number | string | bigint,
  options: {
    decimals?: number;
    compact?: boolean;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const { decimals = 2, compact = false, prefix = '', suffix = '' } = options;
  
  let num: number;
  if (typeof value === 'bigint') {
    num = Number(value);
  } else if (typeof value === 'string') {
    num = parseFloat(value);
    if (isNaN(num)) return '0';
  } else {
    num = value;
  }
  
  if (compact && num >= 1_000_000) {
    return `${prefix}${(num / 1_000_000).toFixed(1)}M${suffix}`;
  }
  
  if (compact && num >= 1_000) {
    return `${prefix}${(num / 1_000).toFixed(1)}K${suffix}`;
  }
  
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  
  return `${prefix}${formatter.format(num)}${suffix}`;
}

// Debounce a function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Truncate a string in the middle
export function truncateMiddle(
  str: string,
  start = 6,
  end = 4,
  separator = '...'
): string {
  if (!str) return '';
  if (str.length <= start + end) return str;
  
  return `${str.slice(0, start)}${separator}${str.slice(-end)}`;
}
