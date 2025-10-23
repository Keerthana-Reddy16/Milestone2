import React, { useEffect, useState } from "react";

function ForecastFilters({
  region,
  service,
  horizon,
  model,
  onRegionChange,
  onServiceChange,
  onHorizonChange,
  onModelChange,
}) {
  const [regions, setRegions] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const resRegions = await fetch("http://localhost:8000/api/features/regions");
        const resServices = await fetch("http://localhost:8000/api/features/resource-types");
        const jsonRegions = await resRegions.json();
        const jsonServices = await resServices.json();
        setRegions(jsonRegions.regions || []);
        setServices(jsonServices.resource_types || []);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    }
    fetchFilters();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow">
      {/* Region */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Region</label>
        <select
          value={region}
          onChange={e => onRegionChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Resource Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Resource Type</label>
        <select
          value={service}
          onChange={e => onServiceChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {services.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Horizon */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Horizon</label>
        <select
          value={horizon}
          onChange={e => onHorizonChange(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {[7, 14, 30, 60, 90].map(h => (
            <option key={h} value={h}>{h} days</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Model</label>
        <select
          value={model}
          onChange={e => onModelChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {["xgboost", "arima", "lstm"].map(m => (
            <option key={m} value={m}>{m.toUpperCase()}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ForecastFilters;