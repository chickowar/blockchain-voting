import { useState, useEffect } from "react";
import { FaArrowRight, FaUser, FaSignOutAlt } from "react-icons/fa";
import { ethers } from "ethers";
import { useAppContext } from "../components/AppContext.jsx";
import { getIdentityCommitment } from "../components/VotingMethods.jsx";

const VOTING_ADDRESS = "0x988B2E8D3108921ee3416cA50Ed1d94984E25951";
const VOTING_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_verifier",
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
                "internalType": "bytes32[]",
                "name": "identityCommitments",
                "type": "bytes32[]"
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
                "internalType": "bytes32[]",
                "name": "",
                "type": "bytes32[]"
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
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "verifier",
        "outputs": [
            {
                "internalType": "contract ISemaphoreVerifier",
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
                "name": "nullifierHash",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "option",
                "type": "uint256"
            },
            {
                "internalType": "uint256[8]",
                "name": "proof",
                "type": "uint256[8]"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export default function LoginPage() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [status, setStatus] = useState("");
    const [identityCommitment, setIdentityCommitment] = useState("");

    const {
        signer, setSigner,
        provider, setProvider,
        setVotingContract,
        voteIdString, setVoteIdString,
    } = useAppContext();

    // Подключение MetaMask
    async function connectMetaMask() {
        if (!window.ethereum) {
            setStatus("❌ Установите MetaMask");
            return;
        }

        try {
            const _provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(_provider);

            const accounts = await _provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            setAccount(address);

            const balanceWei = await _provider.getBalance(address);
            const balanceEth = ethers.formatEther(balanceWei);
            setBalance(parseFloat(balanceEth).toFixed(4));

            const newSigner = await _provider.getSigner();
            setSigner(newSigner);

            const _votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, newSigner);
            setVotingContract(_votingContract);

            setIdentityCommitment(""); // Сбросить старый
            setStatus("✅ MetaMask подключен");
        } catch (err) {
            console.error(err);
            setStatus("❌ Ошибка: " + err.message);
        }
    }

    // Слушаем смену аккаунта в MetaMask
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = async (accounts) => {
            if (accounts.length === 0) {
                // Пользователь отключил MetaMask
                logout();
                setStatus("👋 Аккаунт отключён");
                return;
            }

            const _provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(_provider);

            const newSigner = await _provider.getSigner();
            setSigner(newSigner);

            const address = accounts[0];
            setAccount(address);

            const balanceWei = await _provider.getBalance(address);
            const balanceEth = ethers.formatEther(balanceWei);
            setBalance(parseFloat(balanceEth).toFixed(4));

            const _votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, newSigner);
            setVotingContract(_votingContract);

            setIdentityCommitment(""); // Сбросить старый
            setStatus("🔄 Аккаунт MetaMask обновлён");
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        };
    }, []);

    function logout() {
        setAccount(null);
        setBalance(null);
        setProvider(null);
        setSigner(null);
        setVotingContract(null);
        setIdentityCommitment("");
        setStatus("");
    }


    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-6 p-8 bg-secondary rounded-xl shadow-lg w-[50ch]">
                <FaUser size={120} className="text-primary" />

                {account ? (
                    <>
                        <p className="text-lg text-white">
                            👛 <span className="text-primary">{account}</span>
                        </p>
                        <p className="text-white">💰 Баланс: {balance} ETH</p>

                        {/* Поле для ввода voteIdString */}
                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder="Введите voteIdString"
                                value={voteIdString}
                                onChange={(e) => setVoteIdString(e.target.value)}
                                className="px-4 py-2 border border-primary rounded-lg"
                            />
                            <button
                                onClick={() => {
                                    if (!signer) {
                                        setStatus("❌ Подключите MetaMask");
                                        return;
                                    }
                                    getIdentityCommitment(
                                        voteIdString,
                                        (commitment) => {
                                            setIdentityCommitment(commitment);
                                            localStorage.setItem("identityCommitment", commitment);
                                        },
                                        signer
                                    );
                                }}
                                className="ml-2 px-4 py-2 bg-primary text-white rounded-lg"
                            >
                                Получить Identity Commitment
                            </button>
                        </div>

                        {/* Выводим результат identityCommitment */}
                        {identityCommitment && (
                            <p className="text-white mt-2">
                                Commitment: {identityCommitment}
                            </p>
                        )}

                        <button
                            onClick={logout}
                            className="mt-4 flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                        >
                            <FaSignOutAlt className="mr-2" />
                            Выйти
                        </button>
                    </>
                ) : (
                    <form
                        className="flex w-full max-w-sm space-x-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            connectMetaMask();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Подключите MetaMask"
                            className="flex-grow px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled
                        />
                        <button
                            type="submit"
                            className="p-3 bg-primary text-white rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <FaArrowRight />
                        </button>
                    </form>
                )}

                {status && <p className="text-white">{status}</p>}
            </div>
        </div>
    );
}
