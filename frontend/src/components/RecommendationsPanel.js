import React from "react";

function RecommendationsPanel({ recommendations }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Capacity Recommendations</h2>
      <ul className="list-disc pl-6">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="mb-2 text-gray-700">
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationsPanel;