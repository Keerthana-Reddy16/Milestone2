import React, { useEffect, useState } from "react";
import ForecastChart from "../components/charts/ForecastChart";
import CapacityBarChart from "../components/charts/CapacityBarChart";
import RiskIndicator from "../components/RiskIndicator";
import RecommendationsPanel from "../components/RecommendationsPanel";
import { getForecast, getCapacityAdjustment } from "../services/api";

function CapacityPlanning() {
  // Dynamic filter state
  const [region, setRegion] = useState("East US");
  const [service, setService] = useState("VM");
  const [model, setModel] = useState("xgboost");

  // Dropdown options
  const regionOptions = ["East US", "West US", "North Europe", "Southeast Asia"];
  const serviceOptions = ["VM", "Storage", "Container"];
  const modelOptions = ["xgboost", "arima", "lstm"];

  // Data state
  const [forecastData, setForecastData] = useState([]);
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching with:", { region, service, model });
        const forecastRes = await getForecast({ region, service, model });
        setForecastData(forecastRes.forecast || []);

        const capacityRes = await getCapacityAdjustment({ region, service, model });
        setCapacityInfo(capacityRes);
        setRecommendations([
          `${region} ${service} → ${capacityRes.recommended_adjustment}`
        ]);
      } catch (err) {
        console.error("Error loading capacity planning data:", err);
        setForecastData([]);
        setCapacityInfo(null);
        setRecommendations([]);
      }
    }

    fetchData();
  }, [region, service, model]);

  return (
    <div className="p-6 space-y-6">
      {/* Filter Controls */}
      <div className="flex gap-6 mb-6">
        <div>
          <label className="block font-medium mb-1">Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="border px-2 py-1 rounded">
            {regionOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Service</label>
          <select value={service} onChange={(e) => setService(e.target.value)} className="border px-2 py-1 rounded">
            {serviceOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="border px-2 py-1 rounded">
            {modelOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Forecast Chart */}
      <ForecastChart title="Forecasted Demand" data={forecastData} />

      {/* Capacity Insights */}
      {capacityInfo && (
        <>
          <CapacityBarChart
            forecastDemand={capacityInfo.forecast_demand}
            availableCapacity={capacityInfo.available_capacity}
          />
          <RiskIndicator
            forecastDemand={capacityInfo.forecast_demand}
            availableCapacity={capacityInfo.available_capacity}
          />
        </>
      )}

      {/* Recommendations */}
      <RecommendationsPanel recommendations={recommendations} />
    </div>
  );
}

export default CapacityPlanning;