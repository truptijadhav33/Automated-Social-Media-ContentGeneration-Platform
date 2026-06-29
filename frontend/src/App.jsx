import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BaseLayout from "./components/BaseLayout";
import Launch from "./pages/Launch";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route element={<BaseLayout />}>
          <Route
            path="/"
            element={<h1 className="text-2xl font-bold">Home</h1>}
          />
          <Route path="/launch" element={<Launch />} />
          <Route
            path="/history"
            element={<h1 className="text-2xl font-bold">History</h1>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
