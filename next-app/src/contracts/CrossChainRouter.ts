export const CrossChainRouter = {
  address: process.env.NEXT_PUBLIC_ROUTER_ADDRESS as `0x${string}`,
  abi: [
    // Events
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'fromChainId',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'toChainId',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'sender',
          type: 'address',
        },
        {
          indexed: false,
          name: 'recipient',
          type: 'address',
        },
        {
          indexed: false,
          name: 'token',
          type: 'address',
        },
        {
          indexed: false,
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'fee',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'nonce',
          type: 'uint256',
        },
      ],
      name: 'BridgeInitialized',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'fromChainId',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'toChainId',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'recipient',
          type: 'address',
        },
        {
          indexed: false,
          name: 'token',
          type: 'address',
        },
        {
          indexed: false,
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'fee',
          type: 'uint256',
        },
      ],
      name: 'BridgeCompleted',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'chainId',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'token',
          type: 'address',
        },
        {
          indexed: false,
          name: 'minAmount',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'maxAmount',
          type: 'uint256',
        },
      ],
      name: 'TokenSupported',
      type: 'event',
    },

    // Functions
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'fromChainId',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'toChainId',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'slippageBps',
          type: 'uint256',
        },
      ],
      name: 'bridge',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'fromChainId',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'toChainId',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'calculateBridgeFee',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'chainId',
          type: 'uint256',
        },
      ],
      name: 'getSupportedTokens',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'chainId',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
      ],
      name: 'isTokenSupported',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'txHash',
          type: 'bytes32',
        },
      ],
      name: 'getBridgeStatus',
      outputs: [
        {
          components: [
            {
              internalType: 'bool',
              name: 'completed',
              type: 'bool',
            },
            {
              internalType: 'uint256',
              name: 'timestamp',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'fee',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
          ],
          internalType: 'struct ICrossChainRouter.BridgeStatus',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const,
};
