import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
  Area
} from "recharts";

function ForecastChart({ title, data }) {
  if (!data || data.length === 0) return null;

  // Find forecast start date (first row with actual === null)
  const forecastStart = data.find(d => d.actual === null)?.date;
  const forecastEnd = data[data.length - 1]?.date;

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="text-sm text-gray-500 mb-2">
        Forecast region shaded in green. Confidence interval shown as band around forecast.
      </p>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            }
          />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />

          {/* Historical Actuals */}
          {data.some(d => d.actual !== null) && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#1f77b4"
              dot={false}
              name="Actual"
            />
          )}

          {/* Forecast Line */}
          {data.some(d => d.predicted !== null) && (
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#2ca02c"
              strokeDasharray="4 4"
              dot={false}
              name="Forecast"
            />
          )}

          {/* Confidence Interval Shading */}
          {data.some(d => d.upper_bound !== null && d.lower_bound !== null) && (
            <Area
              type="monotone"
              dataKey="upper_bound"
              stroke={false}
              fill="#c6f6d5"
              fillOpacity={0.4}
              name="Confidence Band"
              baseLine={data.map(d => d.lower_bound)}
            />
          )}

          {/* Forecast Region Highlight */}
          {forecastStart && (
            <ReferenceArea
              x1={forecastStart}
              x2={forecastEnd}
              strokeOpacity={0.3}
              fill="#e6fffa"
              fillOpacity={0.3}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ForecastChart;