import { useState } from "react";
import { FaPlus, FaSpinner, FaTrash, FaCheck } from "react-icons/fa";
import Modal from "../components/Modal.jsx";

export default function CreateVotingPage() {
    const [candidates, setCandidates] = useState([]);
    const [newCandidate, setNewCandidate] = useState("");

    const [voters, setVoters] = useState([]);
    const [newVoter, setNewVoter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [votingTitle, setVotingTitle] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [timeLeft, setTimeLeft] = useState("");

    const [loading, setLoading] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [errorMessages, setErrorMessages] = useState([]);

    // ➕ Добавление кандидата
    const handleAddCandidate = () => {
        const trimmedName = newCandidate.trim();
        if (trimmedName && !candidates.includes(trimmedName)) {
            setCandidates([...candidates, trimmedName]);
            setNewCandidate("");
        }
    };

    // 🗑️ Удаление кандидата
    const handleDeleteCandidate = (index) => {
        setCandidates(candidates.filter((_, i) => i !== index));
    };

    // ✏️ Редактирование кандидата
    const handleEditCandidate = (index, value) => {
        const updatedCandidates = [...candidates];
        updatedCandidates[index] = value;
        setCandidates(updatedCandidates);
    };

    // ➕ Добавление голосующего
    const handleAddVoter = () => {
        const trimmedName = newVoter.trim();
        if (trimmedName && !voters.includes(trimmedName)) {
            setVoters([...voters, trimmedName]);
            setNewVoter("");
        }
    };

    // 🗑️ Удаление голосующего
    const handleDeleteVoter = (index) => {
        setVoters(voters.filter((_, i) => i !== index));
    };

    // ✏️ Редактирование голосующего
    const handleEditVoter = (index, value) => {
        const updatedVoters = [...voters];
        updatedVoters[index] = value;
        setVoters(updatedVoters);
    };

    // ✅ Submit → открыть Modal
    const handleSubmit = () => {
        setResultMessage("");
        setErrorMessages([]);
        setIsModalOpen(true);
        setDefaultEndDateTime();
    };

    // 🗓️ Установить дату по умолчанию (завтра)
    const setDefaultEndDateTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isoString = tomorrow.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        setEndDateTime(isoString);
        calculateTimeLeft(isoString);
    };

    // 🕓 Рассчитать разницу во времени
    const calculateTimeLeft = (value) => {
        const targetDate = new Date(value);
        const now = new Date();
        const diff = targetDate - now;

        if (diff > 0) {
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
            const days = Math.floor(diff / 1000 / 60 / 60 / 24);
            setTimeLeft(`конец через ${days} дней ${hours} часов ${minutes} минут`);
        } else {
            setTimeLeft("Дата уже прошла");
        }
    };

    // ✅ Проверка данных перед созданием
    const validateVotingData = () => {
        const errors = [];
        const now = new Date();
        const end = new Date(endDateTime);

        if (votingTitle.trim() === "") {
            errors.push("Название голосования не указано.");
        }
        if (candidates.length === 0) {
            errors.push("Добавьте хотя бы одного кандидата.");
        }
        if (voters.length === 0) {
            errors.push("Добавьте хотя бы одного голосующего.");
        }
        if (isNaN(end.getTime()) || end <= now) {
            errors.push("Дата окончания должна быть в будущем.");
        }

        return errors;
    };

    // 📤 Финальное создание голосования
    const handleCreateVoting = () => {
        setLoading(true);
        setResultMessage("");
        setErrorMessages([]);

        setTimeout(() => {
            const errors = validateVotingData();

            if (errors.length > 0) {
                setErrorMessages(errors);
                setResultMessage("");
            } else {
                const targetDate = new Date(endDateTime);
                const now = new Date();
                const endsInSeconds = Math.max(Math.floor((targetDate - now) / 1000), 0);

                console.log("Создано голосование:", {
                    title: votingTitle,
                    candidates,
                    voters,
                    endsInSeconds,
                });

                setResultMessage(`Голосование "${votingTitle}" создано!`);
            }

            setLoading(false);
        }, 500);
    };

    return (
        <>
            <div className="flex justify-evenly items-stretch h-screen">
                {/* 📦 Левая часть */}
                <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col">
                    <h2 className="text-2xl text-center font-bold mt-5 mb-4">Candidates</h2>

                    {/* ➕ Добавление кандидата */}
                    <div className="flex px-6 mb-4">
                        <input
                            type="text"
                            value={newCandidate}
                            onChange={(e) => setNewCandidate(e.target.value)}
                            placeholder="Введите имя кандидата"
                            className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleAddCandidate}
                            className="px-4 bg-primary text-white rounded-r-lg hover:bg-primary-light transition-colors"
                        >
                            <FaPlus />
                        </button>
                    </div>

                    {/* 📋 Список кандидатов */}
                    <div className="flex-1 px-6 overflow-y-auto">
                        <ul className="space-y-2">
                            {candidates.map((name, index) => (
                                <li
                                    key={index}
                                    className="p-2 bg-white rounded-lg shadow flex items-center justify-between"
                                >
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => handleEditCandidate(index, e.target.value)}
                                        className="flex-grow bg-transparent border-none focus:outline-none text-primary"
                                    />
                                    <button
                                        onClick={() => handleDeleteCandidate(index)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 📦 Правая часть */}
                <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col">
                    <h2 className="text-2xl text-center font-bold mt-5 mb-4">Voters</h2>

                    {/* ➕ Добавление голосующего */}
                    <div className="flex px-6 mb-4">
                        <input
                            type="text"
                            value={newVoter}
                            onChange={(e) => setNewVoter(e.target.value)}
                            placeholder="Введите имя голосующего"
                            className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleAddVoter}
                            className="px-4 bg-primary text-white rounded-r-lg hover:bg-primary-light transition-colors"
                        >
                            <FaPlus />
                        </button>
                    </div>

                    {/* 📋 Список голосующих */}
                    <div className="flex-1 px-6 overflow-y-auto">
                        <ul className="space-y-2">
                            {voters.map((name, index) => (
                                <li
                                    key={index}
                                    className="p-2 bg-white rounded-lg shadow flex items-center justify-between"
                                >
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => handleEditVoter(index, e.target.value)}
                                        className="flex-grow bg-transparent border-none focus:outline-none text-primary"
                                    />
                                    <button
                                        onClick={() => handleDeleteVoter(index)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 🔘 Submit Button по центру снизу */}
                <div className="absolute flex bottom-0 justify-center p-6">
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-4 bg-primary text-xl text-white font-semibold rounded-4xl hover:bg-primary-light transition-colors shadow-lg"
                    >
                        <FaCheck className="inline mr-2" />
                        Submit
                    </button>
                </div>

            </div>



            {/* 🪟 Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3 className="text-lg font-bold mb-4">Подтверждение данных</h3>

                {/* Название */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Название голосования:</label>
                    <input
                        type="text"
                        value={votingTitle}
                        onChange={(e) => setVotingTitle(e.target.value)}
                        placeholder="Введите название"
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Дата окончания */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Дата и время окончания:</label>
                    <input
                        type="datetime-local"
                        value={endDateTime}
                        onChange={(e) => {
                            setEndDateTime(e.target.value);
                            calculateTimeLeft(e.target.value);
                        }}
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {endDateTime && (
                        <p className="text-sm text-gray-600 mt-1">{timeLeft}</p>
                    )}
                </div>

                {/* Кандидаты и голосующие */}
                <div className="flex gap-4 mb-4">
                    {/* Список кандидатов */}
                    <div className="flex-1 bg-gray-100 rounded-lg p-3 max-h-[50ch] overflow-y-auto">
                        <p className="font-medium mb-2">Кандидаты:</p>
                        <ol className="list-decimal list-inside text-gray-700">
                            {candidates.length ? (
                                candidates.map((c, i) => <li key={i}>{c}</li>)
                            ) : (
                                <li className="italic text-gray-400">Нет кандидатов</li>
                            )}
                        </ol>
                    </div>

                    {/* Список голосующих */}
                    <div className="flex-1 bg-gray-100 rounded-lg p-3 max-h-[50ch] overflow-y-auto">
                        <p className="font-medium mb-2">Голосующие:</p>
                        <ol className="list-decimal list-inside text-gray-700">
                            {voters.length ? (
                                voters.map((v, i) => <li key={i}>{v}</li>)
                            ) : (
                                <li className="italic text-gray-400">Нет голосующих</li>
                            )}
                        </ol>
                    </div>
                </div>

                {/* Ошибки */}
                {errorMessages.length > 0 && (
                    <div className="mb-4 text-red-600">
                        {errorMessages.map((err, i) => (
                            <p key={i}>• {err}</p>
                        ))}
                    </div>
                )}

                {/* Результат */}
                {resultMessage && (
                    <div className="mb-4 text-green-600 font-semibold">
                        {resultMessage}
                    </div>
                )}

                {/* Лоадер или кнопка */}
                {loading ? (
                    <div className="flex justify-center py-4">
                        <FaSpinner className="animate-spin text-primary text-2xl" />
                    </div>
                ) : resultMessage === "" ? (
                    <button
                        onClick={handleCreateVoting}
                        className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                    >
                        <FaCheck className="inline mr-2" />
                        Создать голосование
                    </button>
                ) : null}
            </Modal>
        </>
    );
}
