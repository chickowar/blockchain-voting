import { useState } from "react";
import { FaArrowRight, FaUser, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { ethers } from "ethers";
import {useAppContext} from "../components/AppContext.jsx";
import {getIdentityCommitment} from "../components/VotingMethods.jsx";

const CONTRACT_ADDRESS = "0x8b99025ec986f9d71c67EF936061C24d6B44e9E8";
const CONTRACT_ABI = [
    "function increment() public",
    "function setCounter(uint256 _value) public",
    "function getCounter() public view returns (uint256)",
    "function counter() public view returns (uint256)"
];

const VOTING_ADDRESS = "0x9bf73F06b864Dd795dFF41619569d388A9f093f4";
const VOTING_ABI = [
    "function createVote(bytes32 voteId, bytes32[] identityCommitments, uint256 optionsCount, uint256 votingEnd, bytes32 merkleRoot) nonpayable",
    "constructor(address _verifier) nonpayable",
    "function vote(bytes32 voteId, uint256 nullifierHash, uint256 option, uint256[8] proof) nonpayable",
    "function getCommitments(bytes32 voteId) view returns (bytes32[])",
    "function getGroup(bytes32 voteId) view returns (bytes32, uint256, uint256)",
    "function getResults(bytes32 voteId) view returns (uint256[])",
    "function verifier() view returns (address)"
];


export default function LoginPage() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [status, setStatus] = useState("");
    const [counter, setCounter] = useState(null);
    // const [signer, setSigner] = useState(null);
    //
    // const [provider, setProvider] = useState(null);
    // const [contract, setContract] = useState(null);
    //
    // const [voteIdString, setVoteIdString] = useState(""); // добавляем состояние для voteIdString

    const {
        signer, setSigner,
        provider, setProvider,
        contract, setContract,
        setVotingContract,
        voteIdString, setVoteIdString,
    } = useAppContext();  // Используем контекст

    const [identityCommitment, setIdentityCommitment] = useState(""); // для вывода commit

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

            const signer = await _provider.getSigner();
            setSigner(signer);

            const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            setContract(_contract);

            const _votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);
            setVotingContract(_votingContract);

            await fetchCounter(_contract, _provider);

            setStatus("✅ MetaMask подключен");
        } catch (err) {
            console.error(err);
            setStatus("❌ Ошибка: " + err.message);
        }
    }

    // Получение текущего значения счетчика
    async function fetchCounter(contractInstance, providerInstance) {
        try {
            const readContract = contractInstance || new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerInstance);
            const currentValue = await readContract.getCounter();
            setCounter(currentValue.toString());
        } catch (err) {
            console.error(err);
            setStatus("❌ Ошибка получения счётчика");
        }
    }

    // Вызов increment() (тратит газ)
    async function incrementCounter() {
        if (!contract) {
            setStatus("❌ Контракт не инициализирован");
            return;
        }
        try {
            const tx = await contract.increment();
            setStatus("⛽️ Транзакция отправлена: " + tx.hash);
            await tx.wait();
            setStatus("✅ Счётчик увеличен");
            await fetchCounter(contract, provider);
        } catch (err) {
            console.error(err);
            setStatus("❌ Ошибка increment: " + err.message);
        }
    }

    // Вызов setCounter(_value) (тратит газ)
    async function setCounterValue(value) {
        if (!contract) {
            setStatus("❌ Контракт не инициализирован");
            return;
        }
        try {
            const tx = await contract.setCounter(value);
            setStatus("⛽️ Транзакция отправлена: " + tx.hash);
            await tx.wait();
            setStatus("✅ Счётчик установлен");
            await fetchCounter(contract, provider);
        } catch (err) {
            console.error(err);
            setStatus("❌ Ошибка setCounter: " + err.message);
        }
    }

    function logout() {
        setAccount(null);
        setBalance(null);
        setCounter(null);
        setProvider(null);
        setContract(null);
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
                        <p className="text-white">📟 Счётчик: {counter}</p>

                        <div className="flex justify-center">
                            <button
                                onClick={logout}
                                className="flex items-center mt-4 mb-8 px-4 py-2 bg-primary-dim text-white rounded-lg hover:bg-primary"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Выйти
                            </button>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={incrementCounter}
                                className="flex grow items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                            >
                                <FaPlus className="mr-2" /> Увеличить
                            </button>
                            <button
                                onClick={() => setCounterValue(42)}
                                className="flex grow items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                            >
                                Установить 42
                            </button>
                        </div>

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
                                onClick={() => getIdentityCommitment(voteIdString, setIdentityCommitment, signer)}
                                className="ml-2 px-4 py-2 bg-primary text-white rounded-lg"
                                title="Получить Identity Commitment"
                            >
                                Get I.C.
                            </button>
                        </div>

                        {/* Выводим результат identityCommitment */}
                        {identityCommitment && (
                            <p className="text-white mt-2">Commitment: {identityCommitment}</p>
                        )}
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