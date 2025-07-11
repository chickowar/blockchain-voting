import SideBar from "./components/SideBar.jsx";
import { AppProvider } from "./components/AppContext.jsx";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import VotingPage from "./pages/VotingPage.jsx";
import CreateVotingPage from "./pages/CreateVotingPage.jsx";

function BlankPage({ body }) {
    return (
        <div className="flex h-screen w-screen clip">
            {/* SideBar */}
            <SideBar />

            {/* Body */}
            <div className="bg-background w-full">
                {body}
            </div>

            {/* Отступ справа */}
            <div className="w-1/12">{/* bg-amber-100 */}</div>
        </div>
    );
}

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    {/* Redirect from root to /login */}
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    <Route
                        path="/vote/:id"
                        element={<BlankPage body={<VotingPage />} />}
                    />

                    <Route
                        path="/create"
                        element={<BlankPage body={<CreateVotingPage />} />}
                    />

                    <Route
                        path="/login"
                        element={<BlankPage body={<LoginPage />} />}
                    />

                    <Route
                        path="*"
                        element={<BlankPage body={<NotFoundPage />} />}
                    />
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
