import { useState } from "react";
import { FaArrowRight, FaUser, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x8b99025ec986f9d71c67EF936061C24d6B44e9E8";
const CONTRACT_ABI = [
    "function increment() public",
    "function setCounter(uint256 _value) public",
    "function getCounter() public view returns (uint256)",
    "function counter() public view returns (uint256)"
];

export default function LoginPage() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [status, setStatus] = useState("");
    const [counter, setCounter] = useState(null);

    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);

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
            const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            setContract(_contract);

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
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-6 p-8 bg-secondary rounded-xl shadow-lg w-[50ch]">
                <FaUser size={120} className="text-primary" />

                {account ? (
                    <>
                        <p className="text-lg text-white">
                            👛 <span className="text-primary">{account}</span>
                        </p>
                        <p className="text-white">💰 Баланс: {balance} ETH</p>
                        <p className="text-white">📟 Счётчик: {counter}</p>

                        <div className="flex space-x-2">
                            <button
                                onClick={incrementCounter}
                                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                            >
                                <FaPlus className="mr-2" /> Увеличить
                            </button>
                            <button
                                onClick={() => setCounterValue(42)}
                                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                            >
                                Установить 42
                            </button>
                        </div>

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