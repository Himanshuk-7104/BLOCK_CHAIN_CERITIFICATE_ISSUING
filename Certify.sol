// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certify {
    struct Record {
        uint mineTime;
        uint blockNumber;
        string instituteName;
        string recipientName;
        string courseName;
        string marks;
        string dateOfCompletion;
    }
    mapping(bytes32 => Record) private docHashes;
    constructor() {
        // No visibility specifier needed; constructor is internal by default
    }
    // Function to store records on the blockchain
    function addDocHash(
        bytes32 hash,
        string memory insti,
        string memory reci,
        string memory course,
        string memory grade,
        string memory doc
    ) public {
        Record memory newRecord = Record(
            block.timestamp, // Replaced 'now' with 'block.timestamp'
            block.number,
            insti,
            reci,
            course,
            grade,
            doc
        );
        docHashes[hash] = newRecord;
    }
    
    // Function to verify if a hash exists and retrieve the corresponding record
    function findDocHash(bytes32 hash)
        public
        view
        returns (
            uint,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        return (
            docHashes[hash].blockNumber,
            docHashes[hash].instituteName,
            docHashes[hash].recipientName,
            docHashes[hash].courseName,
            docHashes[hash].marks,
            docHashes[hash].dateOfCompletion
        );
    }
}