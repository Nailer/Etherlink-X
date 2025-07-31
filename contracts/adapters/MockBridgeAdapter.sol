// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IBridgeAdapter.sol";

/**
 * @title MockBridgeAdapter
 * @dev Mock implementation of IBridgeAdapter for testing purposes
 */
contract MockBridgeAdapter is IBridgeAdapter {
    bytes32 public immutable override getBridgeId;
    address public admin;
    
    // Mock fee rate: 0.1% of the bridged amount
    uint256 public constant FEE_RATE = 10; // 0.1% in basis points
    
    // Supported tokens and chains for this mock adapter
    address[] public tokenList;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256[]) public tokenToChains;
    mapping(address => mapping(uint256 => bool)) public isChainSupported;
    
    // Track bridge transactions
    mapping(bytes32 => bool) public bridgeTransactions;
    
    event MockBridged(
        address indexed token,
        uint256 amount,
        uint256 destinationChainId,
        address recipient,
        bytes32 bridgeId
    );
    
    constructor() {
        getBridgeId = keccak256(abi.encodePacked("MOCK_BRIDGE"));
        admin = msg.sender;
        
        // Support native token (address(0)) by default
        _addSupportedToken(address(0));
        
        // Add test chains for native token
        uint256[] memory nativeChains = new uint256[](2);
        nativeChains[0] = 11155111;    // Sepolia (Ethereum testnet)
        nativeChains[1] = 43113;    // Avalanche Fuji
        
        for (uint i = 0; i < nativeChains.length; i++) {
            _addSupportedChain(address(0), nativeChains[i]);
        }
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin");
        _;
    }
    
    /**
     * @dev Internal function to add a supported chain for a token
     */
    function _addSupportedChain(address token, uint256 chainId) internal {
        if (!isChainSupported[token][chainId]) {
            isChainSupported[token][chainId] = true;
            tokenToChains[token].push(chainId);
        }
    }
    
    /**
     * @dev Internal function to add a supported token
     */
    function _addSupportedToken(address token) internal {
        if (!supportedTokens[token]) {
            supportedTokens[token] = true;
            tokenList.push(token);
        }
    }
    
    /**
     * @dev Add a supported token
     * @param token Address of the token to support
     * @param chainIds Array of chain IDs to support for this token
     */
    function addSupportedToken(
        address token,
        uint256[] calldata chainIds
    ) external onlyAdmin {
        require(token != address(0), "Invalid token address");
        _addSupportedToken(token);
        
        for (uint i = 0; i < chainIds.length; i++) {
            _addSupportedChain(token, chainIds[i]);
        }
    }
    
    /**
     * @dev Remove a supported token
     * @param token Address of the token to remove support for
     */
    function removeSupportedToken(address token) external onlyAdmin {
        require(token != address(0), "Cannot remove native token support");
        supportedTokens[token] = false;
    }
    
    /**
     * @dev Get list of supported tokens
     */
    function getSupportedTokens() external view override returns (address[] memory) {
        return tokenList;
    }
    
    /**
     * @dev Get list of supported chains for a token
     * @param token Address of the token
     */
    function getSupportedChains(
        address token
    ) external view override returns (uint256[] memory) {
        return tokenToChains[token];
    }
    
    /**
     * @dev Bridge tokens to another chain
     */
    function bridge(
        address token,
        uint256 amount,
        uint256 destinationChainId,
        address recipient,
        bytes calldata data
    ) external payable override returns (bytes32 bridgeId) {
        require(supportedTokens[token], "Token not supported");
        require(isChainSupported[token][destinationChainId], "Chain not supported for this token");
        require(amount > 0, "Amount must be greater than 0");
        
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect value sent");
        } else {
            // In a real implementation, we would transfer the tokens here
            // For this mock, we'll just check that the contract has the tokens
            (bool success, ) = token.staticcall(
                abi.encodeWithSignature("balanceOf(address)", address(this))
            );
            require(success, "Token balance check failed");
        }
        
        // Generate a unique bridge ID
        bridgeId = keccak256(
            abi.encodePacked(
                block.chainid,
                block.timestamp,
                token,
                amount,
                destinationChainId,
                recipient,
                data,
                block.prevrandao
            )
        );
        
        bridgeTransactions[bridgeId] = true;
        
        emit MockBridged(
            token,
            amount,
            destinationChainId,
            recipient,
            bridgeId
        );
        
        return bridgeId;
    }
    
    /**
     * @dev Estimate the fee for bridging tokens
     */
    function estimateBridgeFee(
        address token,
        uint256 amount,
        uint256 /* destinationChainId */
    ) external view override returns (uint256 fee) {
        require(supportedTokens[token], "Token not supported");
        
        // Calculate fee as 0.1% of the amount
        fee = (amount * FEE_RATE) / 10_000;
        
        // Ensure minimum fee of 0.001 ETH or equivalent
        uint256 minFee = 1e15; // 0.001 ETH
        
        if (fee < minFee) {
            fee = minFee;
        }
        
        return fee;
    }
    
    /**
     * @dev Check if a bridge transaction exists
     * @param bridgeId ID of the bridge transaction
     */
    function hasBridgeTransaction(bytes32 bridgeId) external view returns (bool) {
        return bridgeTransactions[bridgeId];
    }
    
    // Function to receive Ether
    receive() external payable {}
}
