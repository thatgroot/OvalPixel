// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./AntiSnipe.sol";

contract OvalPixelV2 is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    UUPSUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    AntiSnipeV1
{
    uint256 public maxGasPrice;
    uint256 public maxTokensPerWallet;

    mapping(address => bool) private _blacklist;
    mapping(address => bool) private mintableWallets;

    struct Lock {
        uint256 time;
        uint256 amount;
    }

    mapping(address => Lock) public lockedBalances;
    mapping(address => bool) private hasTransferred;

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override onlyOwner {}

    modifier antiMinimumTime(uint256 amount) override {
        if (snipeLimit == 0) {
            hasTransferred[msg.sender] = false;
        }
        require(!hasTransferred[msg.sender], "Transfer already occurred");

        uint256 minimumTimeDelay = lastCall[msg.sender] + snipeLimit;
        uint256 _allowedAmount = (totalSupply() * 1) / 10000; // 0.01% of total supply
        if (block.timestamp < minimumTimeDelay && msg.sender != owner()) {
            require(
                balanceOf(msg.sender) > amount && amount <= _allowedAmount,
                "Amount exceeds allowed limit"
            );

            hasTransferred[msg.sender] = true;
        } else {
            require(
                block.timestamp >= minimumTimeDelay,
                "Minimum time delay not met"
            );
        }

        _;

        lastCall[msg.sender] = block.timestamp;
    }

    modifier antiMinimumTimeTransferFrom(address sender, uint256 amount) {
        if (snipeLimit == 0) {
            hasTransferred[sender] = false;
        }
        require(!hasTransferred[sender], "Transfer already occurred");

        uint256 minimumTimeDelay = lastCall[sender] + snipeLimit;
        uint256 _allowedAmount = (totalSupply() * 1) / 10000; // 0.01% of total supply
        if (block.timestamp < minimumTimeDelay && sender != owner()) {
            require(
                balanceOf(sender) < amount && amount > _allowedAmount,
                "Amount exceeds allowed limit"
            );

            hasTransferred[sender] = true;
        } else {
            require(
                block.timestamp >= minimumTimeDelay,
                "Minimum time delay not met"
            );
        }

        _;

        lastCall[sender] = block.timestamp;
    }

    function test() public returns (string memory) {
        maxTokensPerWallet = 4;
        snipeLimit = 10;
        return "upgraded";
    }

    function initialize() public initializer {
        __ERC20_init("ERC20Upgradable", "EUC");
        __ERC20Burnable_init();
        __Pausable_init();
        __Ownable_init();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function setSnipeLimit(uint256 _limit) external virtual override {}
}
