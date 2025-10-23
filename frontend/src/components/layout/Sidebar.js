import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Table,
  Lightbulb,
  Upload,
  ChartPie,
  LineChart,
  ListOrdered,
  ShieldCheck,
  ClipboardCheck
} from "lucide-react";

export default function Sidebar() {
  const links = [
    { to: "/", label: "Dashboard", icon: <BarChart3 size={18} /> },
    { to: "/features", label: "Feature Table", icon: <Table size={18} /> },
    { to: "/insights", label: "Insights", icon: <Lightbulb size={18} /> },
    { to: "/upload", label: "Upload Data", icon: <Upload size={18} /> },
    { to: "/charts", label: "Charts", icon: <ChartPie size={18} /> },
    { to: "/forecasts", label: "Forecasts", icon: <LineChart size={18} /> },
    { to: "/model-comparison", label: "Model Comparison", icon: <ListOrdered size={18} /> },
    { to: "/capacity-planning", label: "Capacity Planning", icon: <ClipboardCheck size={18} /> }, // 🆕
    { to: "/monitoring", label: "Monitoring", icon: <ShieldCheck size={18} /> } // 🆕
  ];

  return (
    <aside className="w-56 bg-slate-800 text-white min-h-screen p-4">
      <h1 className="text-lg font-bold mb-6">Azure Demand Forecast</h1>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-700 ${
                isActive ? "bg-slate-700 font-semibold" : ""
              }`
            }
          >
            {link.icon} {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}