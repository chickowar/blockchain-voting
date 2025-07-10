import { FaTimes } from "react-icons/fa";
import { useRef } from "react";

export default function Modal({ isOpen, onClose, children }) {
    const duration = "100";
    const backdropRef = useRef(null);
    const mouseDownTarget = useRef(null);

    const handleMouseDown = (e) => {
        // Record where mousedown started
        if (e.target === backdropRef.current) {
            mouseDownTarget.current = "backdrop";
        } else {
            mouseDownTarget.current = "modal";
        }
    };

    const handleMouseUp = (e) => {
        // Only close if both down & up were on backdrop
        if (
            mouseDownTarget.current === "backdrop" &&
            e.target === backdropRef.current
        ) {
            onClose();
        }
        mouseDownTarget.current = null;
    };

    return (
        <div
            ref={backdropRef}
            className={`fixed inset-0 z-50 flex items-center justify-center
            transition-colors duration-${duration} ease-in-out
            ${isOpen ? "bg-black/60 pointer-events-auto" : "bg-black/0 pointer-events-none"}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div
                className={`relative bg-white rounded-lg shadow-xl p-6 max-w-[60ch] w-full
                transform transition-all duration-${duration} ease-in-out
                ${isOpen ? "scale-100 opacity-100" : "scale-80 opacity-0"}`}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    <FaTimes size={20} />
                </button>

                {/* Modal Content */}
                <div className="text-black">{children}</div>
            </div>
        </div>
    );
}
