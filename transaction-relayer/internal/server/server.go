package server

import (
	"context"
	"encoding/hex"
	"fmt"
	"github.com/gin-gonic/gin"
	"math/big"
	"net/http"
	"relayer/internal/contracts"
	"relayer/internal/domain"
	"strings"
)

type Server struct {
	port   string
	caller *contracts.ContractCaller
}

type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func New(port string, caller *contracts.ContractCaller) *Server {
	return &Server{
		port:   port,
		caller: caller,
	}
}

func (s *Server) newApi() *gin.Engine {
	g := gin.New()
	g.POST("/vote", s.handleVote)
	return g
}

func convertRequest(sReq *domain.StringVoteRequest) (*domain.VoteRequest, error) {
	// 1. Преобразование VoteId (hex-строка -> [32]byte)
	voteIdHex := strings.TrimPrefix(sReq.VoteId, "0x")
	voteIdBytes, err := hex.DecodeString(voteIdHex)
	if err != nil {
		return nil, fmt.Errorf("invalid voteId: %v", err)
	}
	if len(voteIdBytes) != 32 {
		return nil, fmt.Errorf("voteId must be 32 bytes, got %d", len(voteIdBytes))
	}
	var voteIdArr [32]byte
	copy(voteIdArr[:], voteIdBytes)

	// 2. Преобразование Option (строка -> big.Int)
	option := new(big.Int)
	_, ok := option.SetString(sReq.Option, 10)
	if !ok {
		return nil, fmt.Errorf("invalid option value: %s", sReq.Option)
	}

	// 3. Преобразование Proof
	proof := &domain.SemaphoreProof{}

	// Вспомогательная функция для преобразования строк в big.Int
	parseBigInt := func(s string) (*big.Int, error) {
		n := new(big.Int)
		_, ok := n.SetString(s, 10)
		if !ok {
			return nil, fmt.Errorf("invalid big.Int value: %s", s)
		}
		return n, nil
	}

	// Преобразуем каждое поле
	if proof.MerkleTreeDepth, err = parseBigInt(sReq.Proof.MerkleTreeDepth); err != nil {
		return nil, fmt.Errorf("merkleTreeDepth: %v", err)
	}
	if proof.MerkleTreeRoot, err = parseBigInt(sReq.Proof.MerkleTreeRoot); err != nil {
		return nil, fmt.Errorf("merkleTreeRoot: %v", err)
	}
	if proof.Nullifier, err = parseBigInt(sReq.Proof.Nullifier); err != nil {
		return nil, fmt.Errorf("nullifier: %v", err)
	}
	if proof.Message, err = parseBigInt(sReq.Proof.Message); err != nil {
		return nil, fmt.Errorf("message: %v", err)
	}
	if proof.Scope, err = parseBigInt(sReq.Proof.Scope); err != nil {
		return nil, fmt.Errorf("scope: %v", err)
	}

	// Преобразуем массив точек
	for i, pointStr := range sReq.Proof.Points {
		if i >= 8 {
			break // Защита от выхода за границы
		}
		if proof.Points[i], err = parseBigInt(pointStr); err != nil {
			return nil, fmt.Errorf("point[%d]: %v", i, err)
		}
	}

	return &domain.VoteRequest{
		VoteId: voteIdArr,
		Option: option,
		Proof:  proof,
	}, nil
}

func (s *Server) handleVote(ctx *gin.Context) {
	// Принимаем запрос
	var sReq domain.StringVoteRequest
	if err := ctx.ShouldBindJSON(&sReq); err != nil {
		fmt.Println("sReq could not be binded")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("sReq.Proof: %+v\n", *sReq.Proof)

	// Конвертируем в бинарный формат
	req, err := convertRequest(&sReq)
	if err != nil {
		fmt.Println("sReq could not be converted")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Conversion failed: " + err.Error()})
		return
	}

	fmt.Printf("req.Proof: %+v\n", *req.Proof)
	fmt.Printf("req: %+v\n", *req)
	fmt.Printf("VoteId: %s\n", hex.EncodeToString(req.VoteId[:]))

	var isValid string
	err = s.caller.CallViewMethod(
		context.Background(),
		"isValidProof",
		&isValid,
		req.VoteId,
		*req.Proof,
	)
	fmt.Printf("isValid: %s\n", isValid)
	if err != nil {
		fmt.Println("isValidProof failed: " + err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Proof validation call failed",
			"details": err.Error(),
		})
		return
	}

	if isValid != "true" {
		fmt.Println("Invalid proof: " + isValid)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": isValid})
		return
	}

	txHash, err := s.caller.CallMethod(
		context.Background(),
		"vote",
		req.VoteId,
		req.Option,
		*req.Proof,
	)
	if err != nil {
		fmt.Println("vote failed: " + err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Voting failed", "details": err.Error()})
		return
	}

	response := gin.H{
		"status":  "success",
		"message": "Vote cast successfully",
		"txHash":  txHash,
	}

	ctx.JSON(http.StatusOK, response)
}

func (s *Server) Run() error {
	eng := s.newApi()
	err := eng.Run(":" + s.port)
	if err != nil {
		fmt.Println("[userapi] server run err:", err)
		return err
	}
	return nil
}
