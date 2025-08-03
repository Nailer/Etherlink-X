import type { Address } from 'viem';

/**
 * Format an Ethereum address to a shorter version
 * @param address The full Ethereum address
 * @param startLength Number of characters to show at the start (default: 6)
 * @param endLength Number of characters to show at the end (default: 4)
 * @returns Formatted address (e.g., 0x1234...5678)
 */
export const formatAddress = (
  address: Address | string | undefined,
  startLength = 6,
  endLength = 4
): string => {
  if (!address) return '';
  
  const addr = address.toString();
  if (addr.length <= startLength + endLength) return addr;
  
  return `${addr.substring(0, startLength)}...${addr.substring(addr.length - endLength)}`;
};

/**
 * Format a token amount with the right number of decimal places
 * @param amount The raw amount as a string or bigint
 * @param decimals The number of decimal places
 * @param maxDecimals Maximum number of decimal places to show (default: 6)
 * @returns Formatted amount as a string
 */
export const formatTokenAmount = (
  amount: string | bigint,
  decimals: number,
  maxDecimals = 6
): string => {
  try {
    const amountStr = amount.toString();
    const [whole, fraction = ''] = amountStr.split('.');
    
    if (!fraction) return amountStr;
    
    const trimmedFraction = fraction.length > maxDecimals 
      ? fraction.substring(0, maxDecimals) 
      : fraction;
    
    return `${whole}.${trimmedFraction}`;
  } catch (err) {
    console.error('Error formatting token amount:', err);
    return '0';
  }
};

/**
 * Format a large number with commas for thousands
 * @param num The number to format
 * @returns Formatted number as a string
 */
export const formatNumber = (num: number | string): string => {
  try {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(number);
  } catch (err) {
    console.error('Error formatting number:', err);
    return '0';
  }
};

/**
 * Format a USD value
 * @param amount The amount to format
 * @returns Formatted USD string (e.g., $1,234.56)
 */
export const formatUSD = (amount: number | string): string => {
  try {
    const number = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  } catch (err) {
    console.error('Error formatting USD:', err);
    return '$0.00';
  }
};

/**
 * Format a percentage value
 * @param value The percentage value (0-100)
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., 12.34%)
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a timestamp to a human-readable date
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string (e.g., "Jan 1, 2023, 12:00 PM")
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format a duration in seconds to a human-readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration (e.g., "2h 30m" or "1d 5h")
 */
export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  
  return parts.length > 0 ? parts.join(' ') : '< 1m';
};
