import { BrowserRouter, Routes, Route } from "react-router-dom";
import BaseLayout from "./components/BaseLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BaseLayout />}>
          <Route
            path="/"
            element={<h1 className="text-2xl font-bold">Home</h1>}
          />
          <Route
            path="/launch"
            element={<h1 className="text-2xl font-bold">New Launch</h1>}
          />
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
