import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";

export default function PeakUsageChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) return <div>No data available</div>;

  return (
    <ChartCard title="Peak CPU Usage by Region">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="region" />
          <YAxis />
          <Tooltip formatter={v => (typeof v === "number" ? `${v}%` : v)} />
          <Bar dataKey="cpu_peak" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
