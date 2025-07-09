
// Из public можно доставать просто по имя_файла а из assets по ./assets/имя_файла

import SideBar from "./components/SideBar.jsx";
import {BrowserRouter, Route, Router, Routes} from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

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

      <BrowserRouter>
        <Routes>
            <Route
                path="/"
                element={<BlankPage body={<span>Main</span>}/>}
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
  );
}

export default App
