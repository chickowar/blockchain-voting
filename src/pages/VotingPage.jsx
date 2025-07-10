import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { castVote, getResults } from "../components/VotingMethods";
import { useAppContext } from "../components/AppContext";
import { ethers } from "ethers";

// const fakeRes = [0,1,2,3,4,3,2,1,0,1,1,1,1];
// const fakeMaxCnt = 4;

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

    const [maxCount, setMaxCount] = useState(0);

    useEffect(()=>{
        setMaxCount(Math.max(...results));
    }, [results])


    return (
        <div className="flex justify-evenly items-stretch h-screen">
            {/* Левый блок — ввод опции */}
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col">
                <h2 className="text-2xl text-center font-bold my-5">Выберите опцию</h2>
                <div className="flex-1 px-6 flex flex-col items-center justify-center w-full">
                    <div className="w-full max-h-96 overflow-y-auto bg-secondary rounded-lg p-2 space-y-2">
                        {results.map((_, index) => (
                            <div
                                key={index}
                                onClick={() => setVoteNumber(index.toString())}
                                className={`cursor-pointer rounded-lg px-4 py-3 shadow 
                        ${
                                    voteNumber === index.toString()
                                        ? "bg-primary text-white"
                                        : "bg-secondary-light hover:bg-primary-dim"
                                } transition-colors duration-200`}
                            >
                                <p className="text-lg font-bold">Опция {index}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center bg-tetriary p-4 rounded-b-xl">
                    {/* Error / Status Message */}
                    <div className="flex-shrink-0 w-0 flex-1 mr-4 overflow-hidden">
                        <p className="text-red-500 text-sm break-words">
                            {error || statusMessage}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleVoteSubmit}
                        disabled={voteNumber === ""}
                        className="w-12 h-12 flex items-center justify-center
                        bg-primary text-white rounded-lg hover:bg-primary-light transition-all
                        disabled:opacity-50 disabled:text-gray-400"
                    >
                        <FaCheck size={20} />
                    </button>
                </div>


            </div>

            {/* Правый блок — вывод результатов */}
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold my-5">Результаты</h2>
                <div className="grow space-y-2 flex w-full p-6 flex-col my-auto items-stretch overflow-y-auto rounded-b-xl bg-secondary-light">
                    {results.map((count, index) => (
                    // {fakeRes.map((count, index) => (
                        <div
                            key={index}
                            className="relative flex justify-between bg-primary-dim rounded-lg px-4 py-2 shadow-lg"
                        >
                            {/* Fill */}
                            <div
                                className="absolute inset-0 bg-primary opacity-80 rounded-lg "
                                style={{ width: `${(count / maxCount) * 100}%` }}
                                // style={{width: `${count/fakeMaxCnt * 100}%`}}
                            ></div>

                            {/* Content */}
                            <p className="relative z-10 text-left text-lg font-semibold text-gray-200">Опция {index}</p>
                            <p className="relative z-10 text-right text-gray-700">{count}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
