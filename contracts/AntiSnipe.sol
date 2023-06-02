// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract AntiSnipeV1 is OwnableUpgradeable {
    uint256 public snipeLimit;
    uint256 public delay;

    mapping(address => uint256) public lastCall;

    modifier antiMinimumTime(address sender, uint256 amount) virtual;

    function setSnipeLimit(uint256 _limit) external virtual;
}
