import { useState, useEffect } from "react";
import { FaArrowRight, FaUser, FaSignOutAlt } from "react-icons/fa";
import { ethers } from "ethers";
import { useAppContext } from "../components/AppContext.jsx";
import { getIdentityCommitment } from "../components/VotingMethods.jsx";

const VOTING_ADDRESS = "0xEf00Ff4B51FF253E4f83C20b466ca708360BDe11";
const VOTING_ABI = [
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
        <div className="flex items-center justify-center text-center min-h-screen">
            <div className="flex flex-col items-stretch space-y-4 p-8 bg-secondary rounded-xl shadow-lg w-[60ch]">
                <div className='flex justify-center'>
                    <FaUser size={120} className="text-primary" />
                </div>
                {account ? (
                    <>
                        <p className="text-lg text-white">
                            👛 <span className="text-primary">{account}</span>
                        </p>
                        <p className="text-white">💰 Баланс: {balance} ETH</p>

                        {/* Поле для ввода voteIdString */}
                        <div className="flex mb-8">
                            <input
                                type="text"
                                placeholder="Введите voteIdString"
                                value={voteIdString}
                                onChange={(e) => setVoteIdString(e.target.value)}
                                className="px-4 py-2 border border-primary rounded-lg grow"
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
                                title="Получить Identity Commitment"
                            >
                                Get I.C.
                            </button>
                        </div>

                        {/* Выводим результат identityCommitment */}
                        {identityCommitment && (
                            <p className="text-white mt-2">
                                Commitment: {identityCommitment}
                            </p>
                        )}

                        <div className="flex justify-center">
                            <button
                                onClick={logout}
                                className="flex items-center mt-4 mb-8 px-4 py-2 bg-primary-dim text-white rounded-lg hover:bg-primary"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Выйти
                            </button>
                        </div>
                    </>
                ) : (
                    <form
                        className="flex flex-grow justify-stretch w-full space-x-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            connectMetaMask();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Подключите MetaMask"
                            className="grow px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled
                        />
                        <button
                            type="submit"
                            className="flex justify-center p-3 bg-primary text-white rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <FaArrowRight/>
                        </button>
                    </form>
                )}

                {status && <div className='text-wrap break-all'><p className="text-white">{status}</p></div>}
            </div>
        </div>
    );
}