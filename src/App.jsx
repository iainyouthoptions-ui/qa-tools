import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FreelanceReflection from "./Tools/freelance-reflection/FreelanceReflection";
import PlaytestAnalyser from "./Tools/playtest-analyser/PlaytestAnalyser";
import PlaytestPlanner from "./Tools/playtest-planner/PlaytestPlanner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FreelanceReflection />} />
        <Route path="/playtest-analyser" element={<PlaytestAnalyser />} />
        <Route path="/playtest-planner" element={<PlaytestPlanner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
