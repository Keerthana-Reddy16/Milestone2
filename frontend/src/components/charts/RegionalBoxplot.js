import React from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";

export default function RegionalBoxplot({ data }) {
  if (!Array.isArray(data) || data.length === 0) return <div>No data available</div>;

  return (
    <ChartCard title="Regional CPU Usage Variation">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <XAxis dataKey="region" />
          <YAxis />
          <Tooltip formatter={val => (typeof val === "number" ? val.toFixed(2) : val)} />
          <Legend />
          <Bar dataKey="min" fill="#3b82f6" name="Min Usage" />
          <Bar dataKey="max" fill="#ef4444" name="Max Usage" />
          <Line dataKey="median" stroke="#f59e0b" name="Median" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
