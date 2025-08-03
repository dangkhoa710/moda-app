import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import ModaMenu from "./pages/ModaMenu";
import Mac from "./pages/Mac";
import Owr from "./pages/Owr";
import Di from "./pages/Di";
import An from "./pages/An";
import { getUserData } from "./utils/localStorage";
import { Suggestion } from "./pages/Suggestion";
import "./App.css";
import SchedulesPage from "./components/SchedulesPage";
import { SuggestionRedirect } from "./components/SuggestionRedirect";

function App() {
  const user = getUserData();

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/menu" : "/home"} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/menu" element={<ModaMenu />} />
        <Route path="/mac" element={<Mac />} />
        <Route path="/owr" element={<Owr />} />
        <Route path="/di" element={<Di />} />
        <Route path="/an" element={<An />} />
        <Route path="/suggestion" element={<Suggestion />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/goiy" element={<SuggestionRedirect />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
