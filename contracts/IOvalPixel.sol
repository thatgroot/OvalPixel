// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IOvalPixel {
    function maxTokensPerWallet() external view returns (uint256);

    function isWhitelisted(address account) external view returns (bool);

    function setMaxTokensPerWallet(uint256 maxTokens) external;

    function addToBlacklist(address account) external;
    function removeFromBlacklist(address account) external;

}
