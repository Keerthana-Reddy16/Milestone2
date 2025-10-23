// components/charts/ChartCard.js
import React from "react";

export default function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}
