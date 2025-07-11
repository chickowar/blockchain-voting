import { useState, useEffect } from "react";
import { FaArrowRight, FaUser, FaSignOutAlt } from "react-icons/fa";
import { ethers } from "ethers";
import { useAppContext } from "../components/AppContext.jsx";
import { getIdentityCommitment } from "../components/VotingMethods.jsx";
import {getProviderSignerVotingContract, VOTING_ABI, VOTING_ADDRESS} from "../assets/voting_config.js";


export default function LoginPage() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [status, setStatus] = useState("");

    const {
        signer, setSigner,
        provider, setProvider,
        setVotingContract,
        voteIdString, setVoteIdString,
        identityCommitment, setIdentityCommitment,
    } = useAppContext();

    useEffect(() => {
        const restoreAccount = async () => {
            if (localStorage.getItem("isConnected") === "true" && signer && provider) {
                try {
                    const address = await signer.getAddress();
                    setAccount(address);

                    const balanceWei = await provider.getBalance(address);
                    const balanceEth = ethers.formatEther(balanceWei);
                    setBalance(parseFloat(balanceEth).toFixed(4));

                    setStatus("✅ Восстановлено из AppContext");
                } catch (err) {
                    console.error("❌ Ошибка при восстановлении аккаунта:", err);
                    logout();
                }
            }
        };

        restoreAccount();
    }, [signer, provider]);


    // Подключение MetaMask
    async function connectMetaMask() {
        if (!window.ethereum) {
            setStatus("❌ Установите MetaMask");
            return;
        }

        try {
            const providerSignerVotingContract = await getProviderSignerVotingContract();

            const _provider = providerSignerVotingContract.provider;
            setProvider(_provider);

            const accounts = await _provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            setAccount(address);

            const balanceWei = await _provider.getBalance(address);
            const balanceEth = ethers.formatEther(balanceWei);
            setBalance(parseFloat(balanceEth).toFixed(4));

            const newSigner = providerSignerVotingContract.signer;
            setSigner(newSigner);

            const _votingContract = providerSignerVotingContract.votingContract;
            setVotingContract(_votingContract);

            setIdentityCommitment(""); // Сбросить старый
            setVoteIdString("");

            localStorage.setItem("isConnected", "true");

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

            const providerSignerVotingContract = await getProviderSignerVotingContract();

            const _provider = providerSignerVotingContract.provider;
            setProvider(_provider);

            const newSigner = providerSignerVotingContract.signer;
            setSigner(newSigner);

            const address = accounts[0];
            setAccount(address);

            const balanceWei = await _provider.getBalance(address);
            const balanceEth = ethers.formatEther(balanceWei);
            setBalance(parseFloat(balanceEth).toFixed(4));

            const _votingContract = providerSignerVotingContract.votingContract;
            setVotingContract(_votingContract);

            setIdentityCommitment(""); // Сбросить старый
            setVoteIdString("");


            localStorage.setItem("isConnected", "true");
            setStatus("🔄 Аккаунт MetaMask обновлён");
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        };
    }, []);

    function logout() {
        localStorage.setItem("isConnected", "false");
        setAccount(null);
        setBalance(null);
        setProvider(null);
        setSigner(null);
        setVotingContract(null);
        setIdentityCommitment("");
        setVoteIdString("");
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
                                className="ml-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                                title="Получить Identity Commitment"
                            >
                                Get I.C.
                            </button>
                        </div>

                        {/* Выводим результат identityCommitment */}
                        {identityCommitment && (
                            <p className="text-white break-all mt-2">
                                Commitment: {identityCommitment}
                            </p>
                        )}

                        <div className="flex justify-center">
                            <button
                                onClick={logout}
                                className="flex items-center mb-8 px-4 py-2 bg-primary-dim text-white rounded-lg hover:bg-primary"
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