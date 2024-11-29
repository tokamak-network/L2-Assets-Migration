// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IDAOCommittee{
    function isMember(address _candidate) external returns (bool);
}