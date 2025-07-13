// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract MultiManagedAccess {
    uint constant MANAGER_NUMBERS = 5;
    uint immutable BACKUP_MANAGER_NUMBERS; // 반드시 constructor 에서 초기화

    address public owner;
    address[MANAGER_NUMBERS] public managers;
    bool[MANAGER_NUMBERS] public confirmed;
    mapping(uint256 => bool[MANAGER_NUMBERS]) public confirmedRq;

    // manager0 --> confirmed0
    // manager1 --> confirmed1
    // ...

    constructor(
        address _owner,
        address[] memory _managers,
        uint _manager_numbers
    ) {
        require(_managers.length == _manager_numbers, "size unmatched");
        owner = _owner;
        BACKUP_MANAGER_NUMBERS = _manager_numbers;
        for (uint i = 0; i < _manager_numbers; i++) {
            managers[i] = _managers[i];
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    function allConfirmed() internal view returns (bool) {
        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            if (!confirmed[i]) {
                return false;
            }
        }
        return true;
    }

    function reset() internal {
        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            confirmed[i] = false;
        }
    }

    modifier onlyAllConfirmed() {
        require(allConfirmed(), "Not all confirmed yet");
        reset();
        _;
    }

    function confirm() external {
        bool found = false;

        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            if (managers[i] == msg.sender) {
                found = true;
                confirmed[i] = true;
                break;
            }
        }
        require(found, "You are not a manager");
    }
}
