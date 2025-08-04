'use client';

import { useAccount, useDisconnect, useEnsName, useEnsAvatar } from 'wagmi';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatAddress } from '@/lib/utils';
import { ChevronDown, LogOut, Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  if (!isConnected || !address) {
    return (
      <Button variant="outline" size="sm" className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  const displayAddress = ensName || formatAddress(address);
  const displayInitials = displayAddress.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 pl-2 pr-2">
          <Avatar className="h-6 w-6">
            {ensAvatar ? (
              <AvatarImage src={ensAvatar} alt={ensName || ''} />
            ) : (
              <AvatarFallback className="text-xs">
                {displayInitials}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="hidden sm:inline">{displayAddress}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
