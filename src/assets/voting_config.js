import {ethers} from "ethers";

export const VOTING_ADDRESS = "0xd4EAe144036aeDF0142974677DAFa0f9c304751F";
export const VOTING_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "semaphoreAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "voteId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "nullifierHash",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "option",
                "type": "uint256"
            }
        ],
        "name": "checkVoteConditions",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "voteId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256[]",
                "name": "identityCommitments",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256",
                "name": "optionsCount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "votingEnd",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "merkleRoot",
                "type": "bytes32"
            }
        ],
        "name": "createVote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "voteId",
                "type": "bytes32"
            }
        ],
        "name": "getCommitments",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "voteId",
                "type": "bytes32"
            }
        ],
        "name": "getGroup",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "merkleRoot",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "votingEnd",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "optionsCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "voteId",
                "type": "bytes32"
            }
        ],
        "name": "getResults",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "counts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "groupOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "voteId",
                "type": "bytes32"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "merkleTreeDepth",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "merkleTreeRoot",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "nullifier",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "message",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "scope",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256[8]",
                        "name": "points",
                        "type": "uint256[8]"
                    }
                ],
                "internalType": "struct ISemaphore.SemaphoreProof",
                "name": "proof",
                "type": "tuple"
            }
        ],
        "name": "isValidProof",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "semaphore",
        "outputs": [
            {
                "internalType": "contract ISemaphore",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "voteId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "option",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "merkleTreeDepth",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "merkleTreeRoot",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "nullifier",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "message",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "scope",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256[8]",
                        "name": "points",
                        "type": "uint256[8]"
                    }
                ],
                "internalType": "struct ISemaphore.SemaphoreProof",
                "name": "proof",
                "type": "tuple"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export async function getProviderSignerVotingContract() {
    const _provider = new ethers.BrowserProvider(window.ethereum);
    const _signer = await _provider.getSigner();
    const _votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, _signer);

    return {provider: _provider, votingContract: _votingContract, signer: _signer};
}