// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IBridgeAdapter
 * @dev Interface for bridge adapters to enable cross-chain transfers
 */
interface IBridgeAdapter {
    /**
     * @dev Emitted when assets are bridged to another chain
     */
    event AssetsBridged(
        address indexed token,
        uint256 amount,
        uint256 destinationChainId,
        address recipient,
        bytes32 bridgeId
    );

    /**
     * @dev Returns the unique identifier for this bridge
     */
    function getBridgeId() external view returns (bytes32);

    /**
     * @dev Returns the list of supported tokens for this bridge
     */
    function getSupportedTokens() external view returns (address[] memory);

    /**
     * @dev Returns the list of supported destination chains for a given token
     * @param token Address of the token to check
     */
    function getSupportedChains(address token) external view returns (uint256[] memory);

    /**
     * @dev Bridges tokens to another chain
     * @param token Address of the token to bridge
     * @param amount Amount of tokens to bridge
     * @param destinationChainId Chain ID of the destination chain
     * @param recipient Address on the destination chain to receive the tokens
     * @param data Additional data for the bridge
     */
    function bridge(
        address token,
        uint256 amount,
        uint256 destinationChainId,
        address recipient,
        bytes calldata data
    ) external payable returns (bytes32 bridgeId);

    /**
     * @dev Estimates the fee for bridging tokens
     * @param token Address of the token to bridge
     * @param amount Amount of tokens to bridge
     * @param destinationChainId Chain ID of the destination chain
     * @return fee Estimated fee in native token
     */
    function estimateBridgeFee(
        address token,
        uint256 amount,
        uint256 destinationChainId
    ) external view returns (uint256 fee);
}
