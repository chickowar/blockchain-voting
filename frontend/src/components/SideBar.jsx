import './SideBar.css';
import { FaPlus, FaVoteYea, FaUser } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "./Modal.jsx";

function SideBarIcon({onClick, icon, title=null}){
    return <>
        <div className="flex items-center w-full h-24 my-6 overflow-x-visible">
            <div className="sidebar-icon" onClick={onClick}>
                {icon({className: "w-2/3 h-2/3"})}
                {title ? <div className="tooltip">{title}</div> : null}
            </div>

        </div>

    </>;
}

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
            <div className="flex flex-col justify-evenly items-center
        top-0 left-0
        h-screen w-23 max-w-23 min-w-23 m-0
        shadow-lg bg-background-light"
            >
                <SideBarIcon icon={FaPlus}
                             onClick={() => navigate('/create')}
                             title={'Добавить голосование'}

                />

                <SideBarIcon icon={FaUser}
                             onClick={() => navigate('/login')}
                             title={'Авторизация'}
                />

                <SideBarIcon icon={FaVoteYea}
                             onClick={() => setIsModalOpen(true)}
                             title={'Участвовать в голосовании'}
                />

                {/* Modal для ввода ключа */}
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
