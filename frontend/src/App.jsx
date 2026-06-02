import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Chatbot from "./pages/Chatbot.jsx";
import Contact from "./pages/Contact.jsx";
import CostEstimation from "./pages/CostEstimation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DosageCalculator from "./pages/DosageCalculator.jsx";
import HerbicideRecommendation from "./pages/HerbicideRecommendation.jsx";
import ImageEnhancement from "./pages/ImageEnhancement.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Signup from "./pages/Signup.jsx";
import WeedDetection from "./pages/WeedDetection.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="weed-detection" element={<WeedDetection />} />
        <Route path="herbicide" element={<HerbicideRecommendation />} />
        <Route path="dosage" element={<DosageCalculator />} />
        <Route path="cost" element={<CostEstimation />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="enhancement" element={<ImageEnhancement />} />
        <Route path="profile" element={<Profile />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
