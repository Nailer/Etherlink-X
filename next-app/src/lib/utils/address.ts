export function formatAddress(address?: string, chars = 4): string {
  if (!address) return '';
  
  // Handle ENS names
  if (address.endsWith('.eth')) {
    return address;
  }
  
  // Handle regular addresses
  const prefix = address.startsWith('0x') ? 2 : 0;
  return `${address.slice(0, chars + prefix)}...${address.slice(-chars)}`;
}

export function isAddress(value: any): boolean {
  try {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  } catch {
    return false;
  }
}

export function shortenTransactionHash(hash: string, chars = 6): string {
  if (hash.length <= chars * 2 + 2) {
    return hash;
  }
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}
