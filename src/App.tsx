import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ToolPage } from "./pages/ToolPage";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tool/:id" element={<ToolPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
