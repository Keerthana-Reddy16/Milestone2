import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ChartCard from "./ChartCard";
import API from "../../services/api";
import { toast } from "react-toastify";

export default function DayOfWeekBoxplot() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await API.get("/api/insights");
        const raw = res.data?.chart_data?.day_of_week_stats || [];

      const dayMap = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

const formatted = raw.map((d) => ({
  day: dayMap[d.day_of_week], // ✅ This maps 1 → "Mon", etc.
  min: d.min,
  median: d.median,
  max: d.max,
}));


        setData(formatted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load day-of-week stats");
      }
    }

    fetchStats();
  }, []);

  return (
    <ChartCard title="Day of Week CPU Usage (Boxplot)">
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            label={{ value: "Day", position: "insideBottom", offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: "CPU Usage", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(val) => `${val.toFixed(2)} units`} />
          <Legend verticalAlign="top" height={36} />

          {/* Min and Max as bars */}
          <Bar dataKey="min" fill="#3b82f6" name="Min Usage" />
          <Bar dataKey="max" fill="#ef4444" name="Max Usage" />

          {/* Median as line */}
          <Line
            type="monotone"
            dataKey="median"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Median"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
