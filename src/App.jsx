
// Из public можно доставать просто по имя_файла а из assets по ./assets/имя_файла

import SideBar from "./components/SideBar.jsx";

function App() {


  return (
<div className="flex h-screen w-screen">
  <SideBar/>
  <div className="bg-background w-full">

  </div>
  <div className="
  {/*bg-amber-100 */}
  w-1/12">

  </div>
</div>
  );
}

export default App
