// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Simplified Semaphore interface
interface ISemaphore {
    struct SemaphoreProof {
        uint256 merkleTreeDepth;
        uint256 merkleTreeRoot;
        uint256 nullifier;
        uint256 message;
        uint256 scope;
        uint256[8] points;
    }

    function createGroup() external returns (uint256);
    function addMember(uint256 groupId, uint256 identityCommitment) external;
    function validateProof(uint256 groupId, SemaphoreProof calldata proof) external;
    function verifyProof(uint256 groupId, SemaphoreProof calldata proof) external view returns (bool);
}

/// @title ZK‐backed Voting via Semaphore (all‐in‐one file)
contract ZKVote {
    ISemaphore public immutable semaphore;

    /// @dev Map each poll ID to its Semaphore group ID
    mapping(bytes32 => uint256) public groupOf;
    /// @dev Store the list of commitments for each poll
    mapping(bytes32 => uint256[]) private _commitments;

    /// @dev Poll storage
    struct Poll {
        bytes32 merkleRoot;
        uint256 votingEnd;
        uint256 optionsCount;
        bool exists;
        mapping(uint256 => uint256) results;
        mapping(uint256 => bool) nullifierUsed;
    }
    mapping(bytes32 => Poll) private polls;

    /// @param semaphoreAddress address of deployed Semaphore.sol
    constructor(address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
    }

    /// @notice Create a new poll and its Semaphore group
    /// @param voteId       unique poll identifier
    /// @param identityCommitments list of eligible voter commitments
    /// @param optionsCount number of choices
    /// @param votingEnd    UNIX timestamp when poll ends
    /// @param merkleRoot   precomputed root over identityCommitments
    function createVote(
        bytes32 voteId,
        uint256[] calldata identityCommitments,
        uint256 optionsCount,
        uint256 votingEnd,
        bytes32 merkleRoot
    ) external {
        require(!polls[voteId].exists, "Vote already exists");
        require(block.timestamp < votingEnd, "End must be in future");

        // 1) Create group
        uint256 gid = semaphore.createGroup();
        groupOf[voteId] = gid;

        // 2) Add members
        for (uint i = 0; i < identityCommitments.length; i++) {
            semaphore.addMember(gid, identityCommitments[i]);
        }

        // 3) Record commitments
        _commitments[voteId] = identityCommitments;

        // 4) Initialize poll
        Poll storage p = polls[voteId];
        p.exists = true;
        p.merkleRoot = merkleRoot;
        p.votingEnd = votingEnd;
        p.optionsCount = optionsCount;
    }

    /// @notice Check proof validity off‐chain (without writing to state)
    function isValidProof(
        bytes32 voteId,
        ISemaphore.SemaphoreProof calldata proof
    ) external view returns (string memory) {
        Poll storage p = polls[voteId];
        if (!p.exists) return "Vote doesnt exist";
        if (block.timestamp > p.votingEnd) return "Voting ended";
        if (p.nullifierUsed[proof.nullifier]) return "already voted";
        if (proof.merkleTreeRoot != uint256(p.merkleRoot)) return "Merkle root mismatch";

        uint256 gid = groupOf[voteId];

        try semaphore.verifyProof(gid, proof) {
            return "true";
        } catch {
            return "not allowed";
        }
    }

    /// @notice Cast an anonymous vote with a Semaphore proof
    /// @param voteId poll identifier
    /// @param option index chosen [0…optionsCount-1]
    /// @param proof  ZK proof generated off‐chain
    function vote(
        bytes32 voteId,
        uint256 option,
        ISemaphore.SemaphoreProof calldata proof
    ) external {
        Poll storage p = polls[voteId];
        require(p.exists, "No such vote");
        require(block.timestamp <= p.votingEnd, "Voting ended");
        require(option < p.optionsCount, "Bad option");
        require(!p.nullifierUsed[proof.nullifier], "Already voted");
        require(proof.merkleTreeRoot == uint256(p.merkleRoot), "Merkle root mismatch");

        // Validate proof
        uint256 gid = groupOf[voteId];
        semaphore.validateProof(gid, proof);

        // Record
        p.nullifierUsed[proof.nullifier] = true;
        p.results[option] += 1;
    }

    /// @notice Get current vote tallies
    function getResults(bytes32 voteId) external view returns (uint256[] memory counts) {
        Poll storage p = polls[voteId];
        require(p.exists, "No such vote");

        counts = new uint256[](p.optionsCount);
        for (uint i = 0; i < p.optionsCount; i++) {
            counts[i] = p.results[i];
        }
    }

    /// @notice Get basic poll parameters
    function getGroup(bytes32 voteId)
        external
        view
        returns (
            bytes32 merkleRoot,
            uint256 votingEnd,
            uint256 optionsCount
        )
    {
        Poll storage p = polls[voteId];
        require(p.exists, "No such vote");
        return (p.merkleRoot, p.votingEnd, p.optionsCount);
    }

    /// @notice Return the list of identity commitments
    function getCommitments(bytes32 voteId)
        external
        view
        returns (uint256[] memory)
    {
        require(polls[voteId].exists, "No such vote");
        return _commitments[voteId];
    }

    /// @notice Check if a user could vote (off‐chain)
    function checkVoteConditions(
        bytes32 voteId,
        uint256 nullifierHash,
        uint256 option
    ) external view returns (string memory) {
        Poll storage p = polls[voteId];
        if (!p.exists)                 return "No such vote";
        if (block.timestamp > p.votingEnd) return "Voting ended";
        if (option >= p.optionsCount)      return "Bad option";
        if (p.nullifierUsed[nullifierHash]) return "Already voted";
        return "OK";
    }
}

