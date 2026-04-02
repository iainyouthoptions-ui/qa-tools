import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FreelanceReflection from "./Tools/freelance-reflection/FreelanceReflection";
import PlaytestAnalyser from "./Tools/playtest-analyser/PlaytestAnalyser";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FreelanceReflection />} />
        <Route path="/playtest-analyser" element={<PlaytestAnalyser />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
