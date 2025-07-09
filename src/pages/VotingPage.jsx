import { useParams } from "react-router-dom";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";

export default function VotingPage() {
    const { id } = useParams();
    // TODO: ЕСЛИ КАНДИДАТЫ ИМЕЮТ ОДИНАКОВЫЕ ИМЕНА, ТО ЭТО ПЛОХО, ОНИ НЕ ПРОНУМЕРОВАНЫ. ПОТОМ ИСПРАВИТЬ
    const candidates = [
        "Alice", "Bob", "Charlie", "Diana",
        "Alice1", "Bob1", "Charlie1", "Diana1",
        "Alice2", "Bob2", "Charlie2", "Diana2", "Alice3", "Bob3", "Charlie3", "Diana3",
    ];

    // 💥 Храним выбранных кандидатов в состоянии
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    const toggleCandidate = (name) => {
        setSelectedCandidates((prev) =>
            prev.includes(name)
                ? prev.filter((c) => c !== name) // убираем если уже выбран
                : [...prev, name]               // добавляем если не выбран
        );
    };

    return (
        <div className="flex justify-evenly items-stretch h-screen">
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col">
                {/* 🗳️ Candidates */}
                <h2 className="text-2xl text-center font-bold mt-5 mb-4">Candidates</h2>
                <div className="flex-1 px-6 overflow-y-auto">
                    <ul className="space-y-2 mb-4">
                        {candidates.map((name, index) => {
                            const isSelected = selectedCandidates.includes(name);
                            return (
                                <li
                                    key={index}
                                    onClick={() => toggleCandidate(name)}
                                    className={`p-2 text-primary bg-white rounded-lg shadow cursor-pointer transition-colors 
                  ${isSelected ? "bg-gray-200" : "hover:bg-gray-100"}`}
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
                    <span className="text-sm text-gray-300 truncate">
            {selectedCandidates.join(", ") || "Никого не выбрали"}
          </span>

                    {/* submit */}
                    <button
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
        </div>
    );
}
