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
            } catch (err) {
                console.error("❌ Ошибка при загрузке результатов:", err);
                setError("Не удалось загрузить результаты");
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

        // Проверка перед голосованием
        console.log("🔍 Checking vote conditions...");
        try {
            const check = await votingContract.checkVoteConditions(
                voteId,
                0, // nullifierHash placeholder, вызываем только for conditions before proof
                parsedOption
            );
            console.log("✅ checkVoteConditions returned:", check);
            if (check !== "OK") {
                setError("Нельзя голосовать: " + check);
                return;
            }
        } catch (e) {
            console.error("❌ Ошибка при вызове checkVoteConditions:", e);
            setError("Ошибка проверки условий: " + (e.reason || e.message));
            return;
        }

        // Всё ок, теперь вызываем castVote
        console.log("🚀 Conditions OK, calling castVote()");
        try {
            console.log("Preview voting contract address:", votingContract);
            console.log("id:", id);
            await castVote(id, parsedOption, signer, votingContract);
            console.log("✅ castVote succeeded");
            setStatusMessage("Голос отправлен!");
            // Обновим результаты после голосования
            const raw = await getResults(id, votingContract);
            console.log("🔁 Raw results after vote:", raw);
            const nums = raw.map(r => Number(r));
            console.log("🔢 Parsed results after vote:", nums);
            setResults(nums);
        } catch (err) {
            console.error("❌ Ошибка при голосовании:", err);
            setError(err.message || "Произошла ошибка при голосовании");
        }
    };

    return (
        <div className="flex justify-evenly items-stretch h-screen">
            {/* Левый блок — ввод опции */}
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col">
                <h2 className="text-2xl text-center font-bold mt-5 mb-4">Введите номер опции</h2>
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
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-4">Результаты</h2>
                <div className="space-y-2">
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

            {/*/!* 🌟 Modal *!/*/}
            {/*<Modal isOpen={isModalOpen} onClose={handleCloseModal}>*/}
            {/*    <h2 className="text-xl font-bold mb-4">Выбранные опции в голосовании {id}:</h2>*/}
            {/*    {selectedCandidates.length > 0 ? (*/}
            {/*        <ul className="list-decimal list-inside pl-5 space-y-1 flex-1 bg-gray-100 rounded-lg p-3 max-h-[30ch] overflow-y-auto">*/}
            {/*            {selectedCandidates.map((name, idx) => (*/}
            {/*                <li key={idx}>{name}</li>*/}
            {/*            ))}*/}
            {/*        </ul>*/}
            {/*    ) : (*/}
            {/*        <p className="text-gray-500">Никого не выбрали</p>*/}
            {/*    )}*/}
            {/*</Modal>*/}
        </div>
    );
}
