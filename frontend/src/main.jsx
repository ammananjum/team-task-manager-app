import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./pages/Register";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <Routes>

    {/* HOME */}
    <Route path="/" element={<Home />} />

    {/* REGISTER (FIRST AUTH PAGE) */}
    <Route path="/register" element={<Register />} />

    {/* LOGIN */}
    <Route path="/login" element={<Login />} />

    {/* DASHBOARD */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

  </Routes>
</BrowserRouter>
);