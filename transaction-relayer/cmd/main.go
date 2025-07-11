package main

import (
	"log"
	"os"
	"relayer/internal/contracts"
	"relayer/internal/server"
)

func main() {
	// Инициализация клиента
	sepoliaRPC := "https://eth-sepolia.public.blastapi.io"
	caller, err := contracts.NewContractCaller(sepoliaRPC)
	if err != nil {
		log.Fatalf("Initialization failed: %v", err)
	}

	// Server init
	port := os.Getenv("PORT")
	log.Printf("listening on port %s", port)
	client := server.New(port, caller)

	if err := client.Run(); err != nil {
		return
	}
}
