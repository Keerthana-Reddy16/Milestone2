import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Insights() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
  API.get("/api/insights")
    .then((r) => {
      console.log("Received insights:", r.data);
      setInsights(r.data);
    })
    .catch(console.error);
}, []);

  if (!insights) return <div className="p-4 text-gray-600">Loading insights...</div>;

  // Utility to format numbers safely
  const formatNumber = (val, decimals = 2) =>
    typeof val === "number" ? val.toFixed(decimals) : "N/A";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Top Regions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">🌍 Top Regions by Utilization</h3>
        <ul className="mt-2 space-y-1">
          {(insights.top_regions_by_utilization ?? []).map((r) => (
            <li key={r.region} className="border-b pb-1 text-sm text-gray-700">
              <strong>{r.region}</strong>: {formatNumber(r.avg_utilization * 100)}%
            </li>
          ))}
        </ul>
      </div>

      {/* Peak Usage Days */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-red-600 mb-2">🔥 Peak Usage Days</h3>
        <ol className="list-decimal pl-4 space-y-1 text-sm text-gray-700">
          {(insights.peak_usage_days ?? []).map((d) => (
            <li key={d.date}>
              {new Date(d.date).toLocaleDateString()}: {formatNumber(d.total_cpu)}
            </li>
          ))}
        </ol>
      </div>

      {/* Monthly CPU Trend */}
      <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
        <h3 className="text-lg font-semibold text-purple-700 mb-2">📈 Monthly CPU Usage Trend</h3>
        <table className="w-full text-sm border border-gray-300 rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">Avg CPU Used</th>
            </tr>
          </thead>
          <tbody>
            {(insights.monthly_cpu_trend ?? []).map((m) => (
              <tr key={m.month_num} className="border-t">
                <td className="p-2">{m.month_num}</td>
                <td className="p-2">{formatNumber(m.cpu_usage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* External Factors Impact */}
<div className="bg-white p-4 rounded-lg shadow md:col-span-2">
  <h3 className="text-lg font-semibold text-indigo-700 mb-4">🌐 External Factors Impact</h3>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
    {Object.entries(insights.correlations ?? {}).map(([factor, scores]) => {
      const impact = scores?.usage_cpu;
      return (
        <div
          key={factor}
          className="bg-gray-50 border border-gray-300 rounded px-3 py-2"
        >
          <strong>{factor.replaceAll("_", " ")}</strong>: Impact Score {formatNumber(impact)}
        </div>
      );
    })}
  </div>
</div>

      {/* Backtest Summary */}
      <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
        <h3 className="text-lg font-semibold text-green-700 mb-2">🧪 Backtest Summary</h3>
        <table className="w-full text-sm border border-gray-300 rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Model</th>
              <th className="p-2 text-left">Windows</th>
              <th className="p-2 text-left">Avg MAE</th>
              <th className="p-2 text-left">Avg RMSE</th>
              <th className="p-2 text-left">MAPE</th>
              <th className="p-2 text-left">Stability (MAE)</th>
            </tr>
          </thead>
          <tbody>
            {(insights.backtest_summary ?? []).map((b) => (
              <tr key={b.model} className="border-t">
                <td className="p-2 font-medium">{b.model}</td>
                <td className="p-2">{b.windows ?? "N/A"}</td>
                <td className="p-2">{formatNumber(b.avg_mae)}</td>
                <td className="p-2">{formatNumber(b.avg_rmse)}</td>
                <td className="p-2">{b.avg_mape ?? "N/A"}</td>
                <td className="p-2">{formatNumber(b.std_mae)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}