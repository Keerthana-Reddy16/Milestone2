import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import FeatureTablePage from "./pages/FeatureTablePage";
import Insights from "./pages/Insights";
import UploadPage from "./pages/UploadPage";
import ChartPage from "./pages/ChartPage";

// 🆕 New Pages
import Forecasts from "./pages/Forecasts";
import ModelComparison from "./pages/ModelComparison";
import CapacityPlanning from "./pages/CapacityPlanning"; // 🆕
import Monitoring from "./pages/Monitoring"; // 🆕

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="p-6 bg-slate-50 min-h-screen">
            <Routes>
              {/* Core Pages */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/features" element={<FeatureTablePage />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/charts" element={<ChartPage />} />

              {/* Forecast & Model Comparison */}
              <Route path="/forecasts" element={<Forecasts />} />
              <Route path="/model-comparison" element={<ModelComparison />} />

              {/* 🆕 Capacity Planning & Monitoring */}
              <Route path="/capacity-planning" element={<CapacityPlanning />} />
              <Route path="/monitoring" element={<Monitoring />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}