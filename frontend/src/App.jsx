import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BaseLayout from "./components/BaseLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Launch from "./pages/Launch";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<BaseLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/launch"
            element={<ProtectedRoute><Launch /></ProtectedRoute>}
          />
          <Route
            path="/history"
            element={<ProtectedRoute><History /></ProtectedRoute>}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute><Settings /></ProtectedRoute>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
