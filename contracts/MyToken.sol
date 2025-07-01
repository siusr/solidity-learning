// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Token : smart contract based
// BTC, ETH, XRP, KAIA : native token

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals; // 1 wei --> 1 * 10^-18 // uint8 --> 8 bit unsigned int, uint16, ... , uint256

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, string memory _symbol, uint8 _decimal) {
        name = _name;
        symbol = _symbol;
        decimals = _decimal;
    }

    // function totalSupply() external view returns (uint256) {
    //     return totalSupply;
    // }

    // function balanceOf(address owner) external view returns (uint256) {
    //     return balanceOf[owner];
    // }

    // function name() external view returns (string memory) {
    //     return name;
    // }
}
