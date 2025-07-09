import { FaTimes } from "react-icons/fa";

export default function Modal({ isOpen, onClose, children }) {

    // Не уверен, что это лучшее решение, всё таки никак не юзается backdrop функционал,
    // а также тут возвращается null, что делает сложным/невозможным анимирование появления
    //  исчезновения. Крч, надо будет поправить нврн.

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0  flex items-center justify-center z-50"
            style={{backgroundColor: "rgba(0,0,0,0.6)"}}
            onClick={onClose} // Закрытие по клику на фон
        >
            <dialog
                open
                className="relative bg-white rounded-lg shadow-xl p-6 max-w-[60ch] w-full"
                onClick={(e) => e.stopPropagation()} // Предотвратить закрытие при клике внутри
            >
                {/* Кнопка закрытия */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    <FaTimes size={20} />
                </button>

                {/* Контент */}
                <div>{children}</div>
            </dialog>
        </div>
    );
}
