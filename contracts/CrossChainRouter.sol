// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/IBridgeAdapter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CrossChainRouter
 * @dev Main contract for handling cross-chain routing of assets
 */
contract CrossChainRouter {
    // Struct to store route information
    struct Route {
        address bridgeAdapter;     // Address of the bridge adapter
        address token;             // Address of the token to bridge
        uint256 amount;            // Amount to bridge
        uint256 destinationChainId; // Destination chain ID
        bytes data;                // Additional data for the bridge
    }

    // Mapping from bridge adapter address to its status
    mapping(address => bool) public isBridgeAdapter;
    
    // Mapping from token address to list of supported bridge adapters
    mapping(address => address[]) public tokenToBridgeAdapters;
    
    // Track if an adapter is already added for a token to prevent duplicates
    mapping(address => mapping(address => bool)) private _isAdapterAddedForToken;

    // Owner address
    address public owner;

    // Events
    event BridgeAdapterAdded(address indexed adapter);
    event BridgeAdapterRemoved(address indexed adapter);
    event AssetRouted(
        address indexed token,
        uint256 amount,
        uint256 destinationChainId,
        address indexed recipient,
        address indexed bridgeAdapter,
        bytes32 bridgeId
    );
    
    event BridgeAdapterAdded(
        address indexed adapter,
        address indexed token
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyValidAdapter(address adapter) {
        require(isBridgeAdapter[adapter], "Invalid bridge adapter");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Add a new bridge adapter for a specific token
     * @param adapter Address of the bridge adapter to add
     * @param token Address of the token this adapter supports (address(0) for native token)
     */
    function addBridgeAdapter(address adapter, address token) external onlyOwner {
        require(!isBridgeAdapter[adapter], "Adapter already exists");
        isBridgeAdapter[adapter] = true;
        
        // Add to token's adapter list if not already added
        if (!_isAdapterAddedForToken[token][adapter]) {
            tokenToBridgeAdapters[token].push(adapter);
            _isAdapterAddedForToken[token][adapter] = true;
        }
        
        emit BridgeAdapterAdded(adapter, token);
    }
    
    /**
     * @dev Add a bridge adapter for multiple tokens
     * @param adapter Address of the bridge adapter to add
     * @param tokens Array of token addresses this adapter supports
     */
    function addBridgeAdapterForTokens(
        address adapter,
        address[] calldata tokens
    ) external onlyOwner {
        require(!isBridgeAdapter[adapter], "Adapter already exists");
        isBridgeAdapter[adapter] = true;
        
        for (uint i = 0; i < tokens.length; i++) {
            if (!_isAdapterAddedForToken[tokens[i]][adapter]) {
                tokenToBridgeAdapters[tokens[i]].push(adapter);
                _isAdapterAddedForToken[tokens[i]][adapter] = true;
            }
        }
        
        emit BridgeAdapterAdded(adapter, address(0)); // address(0) indicates multiple tokens
    }

    /**
     * @dev Remove a bridge adapter
     * @param adapter Address of the bridge adapter to remove
     */
    function removeBridgeAdapter(address adapter) external onlyOwner onlyValidAdapter(adapter) {
        isBridgeAdapter[adapter] = false;
        emit BridgeAdapterRemoved(adapter);
    }

    /**
     * @dev Route assets through the specified bridges
     * @param routes Array of routes to execute
     * @param recipient Address on the destination chain to receive the assets
     */
    function routeAssets(Route[] calldata routes, address recipient) external payable {
        require(routes.length > 0, "No routes provided");
        
        // Track total native token value for validation
        uint256 totalNativeValue = 0;
        
        for (uint256 i = 0; i < routes.length; i++) {
            Route calldata route = routes[i];
            require(isBridgeAdapter[route.bridgeAdapter], "Invalid bridge adapter");
            
            // Track native token value for this route
            if (route.token == address(0)) {
                totalNativeValue += route.amount;
            }
            
            // Transfer tokens to the bridge adapter if not native token
            if (route.token != address(0)) {
                // Use IERC20 for safer token transfers
                bool success = IERC20(route.token).transferFrom(
                    msg.sender,
                    route.bridgeAdapter,
                    route.amount
                );
                require(success, "Token transfer failed");
            }
            
            // Call the bridge adapter
            bytes32 bridgeId = IBridgeAdapter(route.bridgeAdapter).bridge{
                value: route.token == address(0) ? route.amount : 0
            }(
                route.token,
                route.amount,
                route.destinationChainId,
                recipient,
                route.data
            );
            
            // Emit event for each route
            emit AssetRouted(
                route.token,
                route.amount,
                route.destinationChainId,
                recipient,
                route.bridgeAdapter,
                bridgeId
            );
        }
        
        // Ensure correct native token value was sent
        if (totalNativeValue > 0) {
            require(msg.value >= totalNativeValue, "Insufficient native token value");
            
            // Refund any excess native token
            if (msg.value > totalNativeValue) {
                (bool success, ) = payable(msg.sender).call{value: msg.value - totalNativeValue}("");
                require(success, "Failed to refund excess native token");
            }
        } else {
            require(msg.value == 0, "Unexpected native token value");
        }
    }

    /**
     * @dev Find the best route for a given token and destination
     * @param token Address of the token to bridge
     * @param amount Amount to bridge
     * @param destinationChainId Destination chain ID
     * @return bestAdapter Address of the best bridge adapter to use
     * @return estimatedFee Estimated fee for the bridge operation
     */
    function findBestRoute(
        address token,
        uint256 amount,
        uint256 destinationChainId
    ) external view returns (address bestAdapter, uint256 estimatedFee) {
        // In a real implementation, this would query the IncentiveOptimizer
        // For now, we'll return the first available adapter with the lowest fee
        
        address[] storage adapters = tokenToBridgeAdapters[token];
        require(adapters.length > 0, "No adapters available for this token");
        
        bestAdapter = address(0);
        estimatedFee = type(uint256).max;
        
        for (uint256 i = 0; i < adapters.length; i++) {
            if (!isBridgeAdapter[adapters[i]]) continue;
            
            try IBridgeAdapter(adapters[i]).estimateBridgeFee(
                token,
                amount,
                destinationChainId
            ) returns (uint256 fee) {
                if (fee < estimatedFee) {
                    estimatedFee = fee;
                    bestAdapter = adapters[i];
                }
            } catch {
                // Skip adapters that revert on estimate
                continue;
            }
        }
        
        require(bestAdapter != address(0), "No suitable bridge adapter found");
    }
    
    // Function to receive Ether
    receive() external payable {}
}
