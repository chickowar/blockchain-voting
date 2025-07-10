import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import Modal from "../components/Modal";
import { castVote, getResults } from "../components/VotingMethods";
import { useAppContext } from "../components/AppContext";
import { ethers } from "ethers";

export default function VotingPage() {
    const { id } = useParams();
    const { votingContract, signer } = useAppContext();

    const [voteNumber, setVoteNumber]       = useState("");
    const [results, setResults]             = useState([]);
    const [error, setError]                 = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    // 1) Загрузка и логирование результатов при монтировании
    useEffect(() => {
        const loadResults = async () => {
            console.log("⏳ Loading results for vote:", id);
            try {
                const raw = await getResults(id, votingContract);
                console.log("✅ Raw results from contract:", raw);
                const nums = raw.map(r => Number(r));
                console.log("🔢 Parsed results:", nums);
                setResults(nums);
                setError("");

            } catch (err) {
                console.error("❌ Ошибка при загрузке результатов:", err);
                if (err.message === `votingContract isn't loaded`){
                    setError("Контракт не загружен, возможно ошибка исправится, если немного подождать");
                } else {
                    setError("Не удалось загрузить результаты");
                }

            }
        };
        loadResults();
    }, [id, votingContract]);

    // 2) Отправка голоса с проверкой условий
    const handleVoteSubmit = async () => {
        setError(null);
        setStatusMessage("");

        const parsedOption = parseInt(voteNumber, 10);
        if (isNaN(parsedOption)) {
            setError("Введите корректный номер опции");
            return;
        }

        // Кодирование voteId
        const voteId = ethers.encodeBytes32String(id);

        console.log("🔍 Проверка условий голосования...");
        try {
            const check = await votingContract.checkVoteConditions(
                voteId,
                0, // placeholder
                parsedOption
            );
            console.log("✅ checkVoteConditions returned:", check);
            if (check !== "OK") {
                setError("Нельзя голосовать: " + check);
                return;
            }
        } catch (e) {
            console.error("❌ Ошибка при checkVoteConditions:", e);
            setError("Ошибка проверки условий: " + (e.reason || e.data?.message || e.message));
            return;
        }

        console.log("🚀 Conditions OK, calling castVote()");
        try {
            await castVote(id, parsedOption, signer, votingContract);
            console.log("✅ Голос успешно отправлен!");

            // Обновляем результаты
            const raw = await getResults(id, votingContract);
            console.log("🔁 Raw results after vote:", raw);
            const nums = raw.map(r => Number(r));
            console.log("🔢 Parsed results after vote:", nums);
            setResults(nums);

            // 🎉 Сообщение о том, что голос отправлен
            setStatusMessage("Голос отправлен!");
        } catch (err) {
            console.error("❌ Ошибка при голосовании:", err);

            // Покажем пользователю сообщение ошибки
            const message = err.reason || err.data?.message || err.message || "Неизвестная ошибка";
            setError("Ошибка при голосовании: " + message);
            setStatusMessage(""); // Очистить "Голос отправлен!" если была ошибка
        }
    };


    return (
        <div className="flex justify-evenly items-stretch h-screen">
            {/* Левый блок — ввод опции */}
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col">
                <h2 className="text-2xl text-center font-bold my-5">Введите номер опции</h2>
                <div className="flex-1 px-6 flex flex-col items-center justify-center">
                    <input
                        type="number"
                        value={voteNumber}
                        onChange={e => setVoteNumber(e.target.value)}
                        placeholder="Например, 1"
                        className="w-40 p-2 border rounded text-center text-lg"
                    />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    {statusMessage && <p className="text-green-500 mt-2">{statusMessage}</p>}
                </div>
                <div className="flex justify-end items-center bg-tetriary p-4 rounded-b-xl">
                    <button
                        onClick={handleVoteSubmit}
                        className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                    >
                        <FaCheck size={20} />
                    </button>
                </div>
            </div>

            {/* Правый блок — вывод результатов */}
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold my-5">Результаты</h2>
                <div className="grow space-y-2 flex flex-col justify-center items-center">
                    {results.map((count, index) => (
                        <div
                            key={index}
                            className="bg-white text-primary rounded-lg px-4 py-2 shadow text-lg"
                        >
                            Опция {index}: {count} голос{count === 1 ? "" : "ов"}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
