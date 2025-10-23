import React from "react";

function MonitoringDashboard({ metrics, drift, lastRetrain }) {
  const getStatus = (mape) => {
    const value = parseFloat(mape);
    if (value < 15) return "🟢 Stable";
    if (value < 30) return "🟡 Caution";
    return "🔴 Retrain Needed";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Model Monitoring</h2>
      <p className="text-sm text-gray-600 mb-4">Last Retrain Date: {lastRetrain || "Unknown"}</p>

      {Object.entries(metrics).map(([model, stats]) => (
        <div key={model} className="mb-4 border-b pb-4">
          <h3 className="text-lg font-bold">{model}</h3>
          <p>MAPE: {stats.MAPE}</p>
          <p>RMSE: {stats.RMSE}</p>
          <p>Status: {getStatus(stats.MAPE)}</p>
        </div>
      ))}

      {drift && (
        <div className="text-red-600 font-semibold mt-4">
          ⚠️ Drift detected — retraining recommended
        </div>
      )}
    </div>
  );
}

export default MonitoringDashboard;