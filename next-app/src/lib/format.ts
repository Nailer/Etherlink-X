import { BridgeStatus } from '@/types';

/**
 * Formats a transaction status for display in the UI
 * @param status - The transaction status
 * @returns Formatted status text with appropriate styling
 */
export function formatTransactionStatus(status: BridgeStatus): {
  text: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'pending':
      return { text: 'Pending', variant: 'secondary' as const };
    case 'completed':
      return { text: 'Completed', variant: 'default' as const };
    case 'failed':
      return { text: 'Failed', variant: 'destructive' as const };
    case 'cancelled':
      return { text: 'Cancelled', variant: 'outline' as const };
    default:
      return { text: 'Unknown', variant: 'outline' as const };
  }
}

/**
 * Formats a timestamp into a relative time string (e.g., "2 minutes ago")
 * @param timestamp - The timestamp in seconds
 * @returns A human-readable relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) {
    return 'Just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }
}

/**
 * Formats a transaction hash for display
 * @param hash - The transaction hash
 * @param start - Number of characters to show at the start
 * @param end - Number of characters to show at the end
 * @returns Formatted hash string (e.g., "0x1234...5678")
 */
export function formatTransactionHash(hash: string, start = 6, end = 4): string {
  if (!hash || hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

/**
 * Formats a token amount with appropriate decimal places
 * @param amount - The amount as a string or bigint
 * @param decimals - Number of decimal places
 * @param displayDecimals - Number of decimal places to display
 * @returns Formatted token amount string
 */
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
    
    // If the truncated fraction is all zeros, just return the whole number
    if (parseInt(truncatedFraction) === 0) {
      return whole;
    }
    
    return `${whole}.${truncatedFraction}`;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
}
