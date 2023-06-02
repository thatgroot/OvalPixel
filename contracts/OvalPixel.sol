// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "./AntiSnipe.sol";
import "./IOvalPixel.sol";

contract OvalPixel is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    UUPSUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    AntiSnipeV1,
    IOvalPixel
{
    uint256 public maxTokensPerWallet;

    mapping(address => bool) private _blacklist;
    mapping(address => bool) private mintableWallets;

    struct Lock {
        uint256 time;
        uint256 amount;
    }

    mapping(address => Lock) public lockedBalances;
    mapping(address => bool) private hasTransferred;

    function initialize() public initializer {
        __ERC20_init("OvalPixel", "OPAIG");
        __ERC20Burnable_init();
        __Pausable_init();
        __Ownable_init();
        _mint(msg.sender, 335_000_000 * 10 ** decimals());
        maxTokensPerWallet = 3;
        snipeLimit = 0;
    }

    function setSnipeLimit(uint256 _limit) public override onlyOwner {
        snipeLimit = block.timestamp + _limit * 1 minutes;
    }

    modifier antiMinimumTime(address sender, uint256 amount) override {
        uint256 _allowedAmount = (totalSupply() * 1) / 10000;
        if (block.timestamp < snipeLimit) {
            if (amount > _allowedAmount || hasTransferred[sender]) {
                require(false, "Minimum time delay not met");
            }
        }
        _;
    }

    modifier onlyMintableWallets() {
        require(
            isMintableWallet(msg.sender) || msg.sender == owner(),
            "Sender is not a mintable wallet"
        );
        _;
    }

    modifier maxTokensWaletLimit(address to, uint256 amount) {
        require(
            this.balanceOf(to) + amount <=
                ((totalSupply() * maxTokensPerWallet) / 100),
            "You can't buy more than 3% of total supply"
        );
        _;
    }

    modifier onlyWhitelisted(address account) {
        require(!_blacklist[account], "Address is not whitelisted");
        _;
    }

    modifier onlyUnlocked(address account, uint256 amount) {
        if (lockedBalances[account].time > block.timestamp) {
            require(
                balanceOf(account) - amount >= lockedBalances[account].amount,
                "Transfer amount exceeds unlocked tokens"
            );
        } else {
            lockedBalances[account] = Lock(0, 0);
            require(
                amount <= balanceOf(account),
                "Transfer amount exceeds unlocked tokens"
            );
        }

        _;
    }

    function getLockedBalanceAndTimeStam(
        address account
    ) public view returns (Lock memory, uint256) {
        return (lockedBalances[account], block.timestamp);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override onlyOwner {}

    function addMintableWallet(address wallet) public onlyOwner {
        mintableWallets[wallet] = true;
    }

    function removeMintableWallet(address wallet) public onlyOwner {
        mintableWallets[wallet] = false;
    }

    function isMintableWallet(address wallet) public view returns (bool) {
        return mintableWallets[wallet];
    }

    function isWhitelisted(address account) public view returns (bool) {
        return !_blacklist[account];
    }

    function setMaxTokensPerWallet(uint256 maxTokens) public onlyOwner {
        maxTokensPerWallet = maxTokens;
    }

    function addToBlacklist(address account) public onlyOwner {
        _blacklist[account] = true;
    }

    function removeFromBlacklist(address account) public onlyOwner {
        _blacklist[account] = false;
    }

    function mint(
        address to,
        uint256 amount
    ) external maxTokensWaletLimit(to, amount) onlyMintableWallets {
        _mint(to, amount);
    }

    function transfer(
        address recipient,
        uint256 amount
    )
        public
        virtual
        override
        onlyWhitelisted(recipient)
        onlyUnlocked(msg.sender, amount)
        antiMinimumTime(msg.sender, amount)
        returns (bool)
    {
        hasTransferred[msg.sender] = snipeLimit > block.timestamp;
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    )
        public
        virtual
        override
        onlyWhitelisted(recipient)
        onlyUnlocked(sender, amount)
        antiMinimumTime(sender, amount)
        returns (bool)
    {
        hasTransferred[msg.sender] = snipeLimit > block.timestamp;
        return super.transferFrom(sender, recipient, amount);
    }

    function transferAndLock(
        address recipient,
        uint256 amount,
        uint16 lockTime,
        uint8 lockPercentage
    ) public virtual onlyWhitelisted(recipient) onlyOwner returns (bool) {
        require(lockPercentage <= 100, "Lock percentage should be <= 100");
        require(amount > 0, "Amount must be greater than zero");

        uint256 lockAmount = (amount * lockPercentage) / 100;

        require(
            balanceOf(msg.sender) >= amount,
            "Insufficient balance for transfer"
        );

        // Transfer the specified amount to the recipient
        _transfer(msg.sender, recipient, amount);

        // Lock the specified percentage of the transferred amount
        lockTokens(recipient, lockAmount, lockTime);

        return true;
    }

    function lockTokens(
        address account,
        uint256 amount,
        uint16 lockTime
    ) internal {
        uint256 time = block.timestamp + lockTime * 1 days;
        lockedBalances[account] = Lock(time, amount);
    }
}
