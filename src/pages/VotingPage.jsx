import { useParams } from "react-router-dom";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import Modal from "../components/Modal"; // 👈 import your Modal

export default function VotingPage() {
    const { id } = useParams();

    const candidates = [
        "Alice", "Bob", "Charlie", "Diana",
        "Alice1", "Bob1", "Charlie1", "Diana1",
        "Alice2", "Bob2", "Charlie2", "Diana2", "Alice3", "Bob3", "Charlie3", "Diana3",
    ];

    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleCandidate = (name) => {
        setSelectedCandidates((prev) =>
            prev.includes(name)
                ? prev.filter((c) => c !== name) // убрать если выбран
                : [...prev, name]               // добавить если не выбран
        );
    };

    const handleSubmit = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex justify-evenly items-stretch h-screen">
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col">
                {/* 🗳️ Candidates */}
                <h2 className="text-2xl text-center font-bold mt-5 mb-4">Опции</h2>
                <div className="flex-1 px-6 overflow-y-auto">
                    <ul className="space-y-2 mb-4">
                        {candidates.map((name, index) => {
                            const isSelected = selectedCandidates.includes(name);
                            return (
                                <li
                                    key={index}
                                    onClick={() => toggleCandidate(name)}
                                    className={`p-2 rounded-lg shadow cursor-pointer transition-colors ${isSelected ?
                                        "text-white bg-primary hover:bg-primary-dim" :
                                        "bg-white hover:bg-gray-200 text-primary hover:text-primary-light"}`}
                                >
                                    {name}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* 📦 Bottom block */}
                <div className="flex justify-between items-center bg-tetriary p-4 rounded-b-xl">
                    {/* Выбранные кандидаты */}
                    <div className="text-sm text-gray-300 flex-1 mr-2 overflow-hidden">
                        <p className="break-words whitespace-normal leading-snug max-h-[4.5rem] overflow-clip">
                            {selectedCandidates.length > 0
                                ? selectedCandidates.join(", ")
                                : "Никого не выбрали"}
                        </p>
                    </div>

                    {/* submit */}
                    <button
                        onClick={handleSubmit}
                        className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                    >
                        <FaCheck size={20} />
                    </button>
                </div>
            </div>

            {/* 📄 RIGHT */}
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex items-center justify-center text-center">
                <span className="font-bold text-2xl">
                    Тут типа можно будет описания потом, либо убрать вообще
                </span>
            </div>

            {/* 🌟 Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <h2 className="text-xl font-bold mb-4">Выбранные опции в голосовании {id}:</h2>
                {selectedCandidates.length > 0 ? (
                    <ul className="list-decimal list-inside pl-5 space-y-1 flex-1 bg-gray-100 rounded-lg p-3 max-h-[30ch] overflow-y-auto">
                        {selectedCandidates.map((name, idx) => (
                            <li key={idx}>{name}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Никого не выбрали</p>
                )}
            </Modal>
        </div>
    );
}
