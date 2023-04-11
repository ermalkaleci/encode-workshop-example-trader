// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@acala-network/contracts/dex/IDEX.sol";
import "@acala-network/contracts/oracle/IOracle.sol";
import "@acala-network/contracts/utils/Predeploy.sol";
import "@acala-network/contracts/utils/AcalaTokens.sol";

contract Trader {
    constructor() payable {}

    function trade() external returns (bool) {
        uint256 price = IOracle(ORACLE).getPrice(ACA);
        if (price < 1e18) {
            revert("price too low");
        }

        address[] memory path = new address[](2);
        path[0] = ACA;
        path[1] = AUSD;
        uint256 amount = address(this).balance / 1_000_000;
        return IDEX(DEX).swapWithExactSupply(path, amount, 0);
    }
}
