// Из public можно доставать просто по имя_файла а из assets по ./assets/имя_файла (вроде)

import SideBar from "./components/SideBar.jsx";
import { AppProvider } from "./components/AppContext.jsx";
import {BrowserRouter, Route, Router, Routes} from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import VotingPage from "./pages/VotingPage.jsx";
import CreateVotingPage from "./pages/CreateVotingPage.jsx";

function BlankPage({body}) {
  return <div className="flex h-screen w-screen clip">
    {/*SideBar*/}
    <SideBar/>

    {/*body*/}
    <div className="bg-background w-full">
          {body}
    </div>

    {/*Отступ справа*/}
    <div className="
      {/*bg-amber-100 */}
      w-1/12">
    </div>

  </div>
}

function App() {

    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<BlankPage body={<span>Main</span>}/>}
                    />

                    <Route
                        path="/vote/:id"
                        element={<BlankPage body={<VotingPage/>}/>}
                    />

                    <Route
                        path="/create"
                        element={<BlankPage body={<CreateVotingPage/>}/>}
                    />

                    <Route
                        path="/login"
                        element={<BlankPage body={<LoginPage/>}/>}
                    />

                    <Route
                        path="*"
                        element={<BlankPage body={<NotFoundPage/>} />}
                    />

                </Routes>
            </BrowserRouter>
        </AppProvider>
  );
}

export default App
