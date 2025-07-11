package domain

import (
	"math/big"
)

type ZKVoteResult struct {
	Counts []*big.Int
}

type ZKVoteGroup struct {
	MerkleRoot   [32]byte
	VotingEnd    *big.Int
	OptionsCount *big.Int
}

type SemaphoreProof struct {
	MerkleTreeDepth *big.Int    `json:"merkleTreeDepth"`
	MerkleTreeRoot  *big.Int    `json:"merkleTreeRoot"`
	Nullifier       *big.Int    `json:"nullifier"`
	Message         *big.Int    `json:"message"`
	Scope           *big.Int    `json:"scope"`
	Points          [8]*big.Int `json:"points"`
}

type ContractProof struct {
	MerkleTreeDepth *big.Int
	MerkleTreeRoot  *big.Int
	Nullifier       *big.Int
	Message         *big.Int
	Scope           *big.Int
	Points          [8]*big.Int
}

type VoteRequest struct {
	VoteId [32]byte        `json:"voteId"`
	Option *big.Int        `json:"option"`
	Proof  *SemaphoreProof `json:"proof"`
}

type StringSemaphoreProof struct {
	MerkleTreeDepth string    `json:"merkleTreeDepth"`
	MerkleTreeRoot  string    `json:"merkleTreeRoot"`
	Nullifier       string    `json:"nullifier"`
	Message         string    `json:"message"`
	Scope           string    `json:"scope"`
	Points          [8]string `json:"points"`
}

type StringVoteRequest struct {
	VoteId string                `json:"voteId"`
	Option string                `json:"option"`
	Proof  *StringSemaphoreProof `json:"proof"`
}
