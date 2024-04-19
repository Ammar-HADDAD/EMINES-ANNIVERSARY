import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./Admin";
import Eplusplus from "./Eplusplus";
import Home from "./assets/Home";
import EplusplusAdmin from "./EplusplusAdmin";
import Results from "./Results";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="E++/admin" element={<EplusplusAdmin />} />
        <Route path="/E++" element={<Eplusplus />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Results" element={<Results />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
