import './SideBar.css';
import { FaPlus, FaVoteYea, FaUser } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "./Modal.jsx";

export default function SideBar() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [voteKey, setVoteKey] = useState("");

    let navigate = useNavigate();

    const handleNavigateToVote = () => {
        const trimmedKey = voteKey.trim();
        if (trimmedKey) {
            navigate(`/vote/${trimmedKey}`);
            setIsModalOpen(false);
            setVoteKey(""); // Очистка поля после перехода
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleNavigateToVote();
        }
    };

    return (
        <>
            <div className="flex flex-col justify-evenly
        top-0 left-0
        h-screen w-1/12 m-0
        shadow-lg bg-background-light overflow-clip"
            >
                <div className="sidebar-icon" onClick={() => navigate('/create')}>
                    <FaPlus size={50} />
                </div>
                <div className="sidebar-icon" onClick={() => navigate('/login')}>
                    <FaUser size={50} />
                </div>
                <div className="sidebar-icon" onClick={() => setIsModalOpen(true)}>
                    <FaVoteYea size={50} />
                </div>

                {/* 🪟 Modal для ввода ключа */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <h3 className="text-lg font-bold mb-4">Введите ключ голосования</h3>
                    <div className="flex">
                        <input
                            type="text"
                            value={voteKey}
                            onChange={(e) => setVoteKey(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Например: 12345"
                            className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleNavigateToVote}
                            className="px-4 bg-primary text-white rounded-r-lg hover:bg-primary-light transition-colors"
                        >
                            <FaVoteYea />
                        </button>
                    </div>
                </Modal>
            </div>
        </>
    );
}
