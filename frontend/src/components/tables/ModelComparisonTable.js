import React from "react";

function ModelComparisonTable({ data, onRetrain }) {
  if (!data || !data.metrics) return <p>No data available.</p>;

  const { best_model, metrics } = data;

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-green-600 font-medium">
          ✅ Best Performing Model: <strong>{best_model}</strong>
        </p>
        <button
          onClick={onRetrain}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200"
        >
          🔁 Retrain Models
        </button>
      </div>

      <table className="w-full border border-gray-300 rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className={thStyle}>Model</th>
            <th className={thStyle}>Type</th>
            <th className={thStyle}>MAE</th>
            <th className={thStyle}>RMSE</th>
            <th className={thStyle}>MAPE</th>
            <th className={thStyle}>Bias</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((model) => (
            <tr
              key={model.model}
              className={
                model.model === best_model
                  ? "bg-green-50 font-bold"
                  : "hover:bg-gray-50 cursor-pointer"
              }
            >
              <td className={tdStyle}>{model.model}</td>
              <td className={tdStyle}>{model.type}</td>
              <td className={tdStyle}>{model.MAE}</td>
              <td className={tdStyle}>{model.RMSE}</td>
              <td className={tdStyle}>{model.MAPE}</td>
              <td className={tdStyle}>{model.Bias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = "px-4 py-2 text-left border-b border-gray-300";
const tdStyle = "px-4 py-2 border-b border-gray-200";

export default ModelComparisonTable;