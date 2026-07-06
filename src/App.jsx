import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CountryDashboard from "./pages/CountryDashboard.jsx";
import KitView from "./pages/KitView.jsx";
import "./App.css";

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:countryId" element={<CountryDashboard />} />
          <Route path="/:countryId/:year" element={<KitView />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
