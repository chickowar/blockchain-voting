package contracts

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
	"log"
	"math/big"
	"os"
	"strings"
)

var contractAddress = common.HexToAddress("0x5C5FA783AFDa7Cd8d9098DE7Ca0438d59c283D73")

var zkVoteABI = `[
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
				"internalType": "string",
				"name": "",
				"type": "string"
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
]`

type ContractCaller struct {
	client     *ethclient.Client
	privateKey string
	chainID    *big.Int
}

func NewContractCaller(rpcURL string) (*ContractCaller, error) {
	// Загрузка переменных из .env
	if err := godotenv.Load(); err != nil {
		return nil, fmt.Errorf("error loading .env file: %v", err)
	}

	// Подключение к Ethereum ноде
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, err
	}

	// Получение ChainID
	chainID, err := client.NetworkID(context.Background())
	if err != nil {
		return nil, err
	}

	return &ContractCaller{
		client:     client,
		privateKey: os.Getenv("PRIVATE_KEY"),
		chainID:    chainID,
	}, nil
}

// CallMethod вызывает метод смарт-контракта
func (cc *ContractCaller) CallMethod(
	ctx context.Context,
	methodName string,
	args ...interface{},
) (*types.Transaction, error) {

	// Парсинг ABI контракта
	parsedABI, err := abi.JSON(strings.NewReader(zkVoteABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse ABI: %v", err)
	}

	// Упаковка данных вызова
	inputData, err := parsedABI.Pack(methodName, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to pack method data: %v", err)
	}

	// Получение аккаунта из приватного ключа
	privateKey, err := crypto.HexToECDSA(strings.TrimPrefix(cc.privateKey, "0x"))
	if err != nil {
		return nil, fmt.Errorf("invalid private key: %v", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("error casting public key")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	// Получение nonce
	nonce, err := cc.client.PendingNonceAt(ctx, fromAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to get nonce: %v", err)
	}
	// Оценка газа
	gasPrice, err := cc.client.SuggestGasPrice(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to suggest gas price: %v", err)
	}

	msg := ethereum.CallMsg{
		To:   &contractAddress,
		Data: inputData,
	}

	gasLimit, err := cc.client.EstimateGas(ctx, msg)
	if err != nil {
		return nil, fmt.Errorf("failed to estimate gas: %v", err)
	}

	// Создание транзакции
	tx := types.NewTransaction(
		nonce,
		contractAddress,
		big.NewInt(0), // Сумма ETH для отправки
		gasLimit,
		gasPrice,
		inputData,
	)

	// Подпись транзакции
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(cc.chainID), privateKey)
	if err != nil {
		return nil, fmt.Errorf("failed to sign transaction: %v", err)
	}

	// Отправка транзакции
	if err := cc.client.SendTransaction(ctx, signedTx); err != nil {
		return nil, fmt.Errorf("failed to send transaction: %v", err)
	}

	return signedTx, nil
}

func (cc *ContractCaller) CallViewMethod(
	ctx context.Context,
	methodName string,
	resultType interface{}, // Указатель на структуру для результата
	args ...interface{},
) error {
	// Парсинг ABI контракта
	parsedABI, err := abi.JSON(strings.NewReader(zkVoteABI))
	if err != nil {
		return fmt.Errorf("failed to parse ABI: %v", err)
	}

	// Упаковка данных вызова
	inputData, err := parsedABI.Pack(methodName, args...)
	if err != nil {
		return fmt.Errorf("failed to pack method data: %v", err)
	}

	// Формируем запрос
	msg := ethereum.CallMsg{
		To:   &contractAddress,
		Data: inputData,
	}

	// Выполняем вызов
	outputData, err := cc.client.CallContract(ctx, msg, nil)
	if err != nil {
		return fmt.Errorf("failed to call contract: %v", err)
	}

	// Распаковываем результат
	if len(outputData) == 0 {
		return fmt.Errorf("no data returned from contract")
	}

	// Если resultType указан - используем его для распаковки
	if resultType != nil {
		err = parsedABI.UnpackIntoInterface(resultType, methodName, outputData)
		if err != nil {
			return fmt.Errorf("failed to unpack result: %v", err)
		}
		return nil
	}

	// Если тип не указан - возвращаем raw данные (для отладки)
	log.Printf("Raw output data: %x", outputData)
	return nil
}
