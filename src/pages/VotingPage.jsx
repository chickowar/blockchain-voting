import { useParams } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

export default function VotingPage() {
    const { id } = useParams();

    const candidates = ["Alice", "Bob", "Charlie", "Diana",
        "Alice", "Bob", "Charlie", "Diana",
        "Alice", "Bob", "Charlie", "Diana", "Alice", "Bob", "Charlie", "Diana",
    ];
    const selectedCandidates = ["Alice", "Charlie"];

    return (
        <div className="flex justify-evenly items-stretch h-screen">
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg flex flex-col">
                {/* Candidates */}
                <h2 className="text-2xl text-center font-bold mt-5 mb-4">Candidates</h2>
                <div className="flex-1 px-6 overflow-y-auto">
                    <ul className="space-y-2 mb-4">
                        {candidates.map((name, index) => (
                            <li
                                key={index}
                                className="p-2 text-primary bg-white rounded-lg shadow cursor-pointer hover:bg-gray-100"
                            >
                                {name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom block */}
                <div className="flex justify-between items-center bg-tetriary p-4 rounded-b-xl">
                    {/* Выбранные кандидаты */}
                    <span className="text-sm text-gray-300">
                        {selectedCandidates.join(", ")}
                    </span>

                    {/* submit */}
                    <button
                        className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                    >
                        <FaCheck size={20} />
                    </button>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg items-center content-center text-center">
                <span className="grow font-bold center text-2xl">Тут типа можно будет описания потом, либо убрать вообще</span>
            </div>
        </div>
    );
}