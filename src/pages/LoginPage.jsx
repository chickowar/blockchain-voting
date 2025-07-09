import {FaArrowRight, FaUser} from "react-icons/fa"

export default function LoginPage() {

    return     <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-6 p-8 bg-secondary rounded-xl shadow-lg">
            {/* Иконка профиля */}
            <FaUser size={120} className="text-primary" />

            {/* Форма логина */}
            <form className="flex w-full max-w-sm space-x-2">
                <input
                    type="text"
                    placeholder="Введите кошелёк"
                    className="flex-grow px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                    type="submit"
                    className="p-3 bg-primary text-white rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <FaArrowRight />
                </button>
            </form>
        </div>
    </div>
}