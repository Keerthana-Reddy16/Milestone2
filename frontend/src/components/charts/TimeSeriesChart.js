// // import React from 'react';
// // import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// // import dayjs from 'dayjs';

// // export default function TimeSeriesChart({ data, xKey, yKey, groupKey }) {
// //   if (!data || data.length === 0) return <div>No data</div>;

// //   // Get unique regions
// //   const regions = [...new Set(data.map(d => d[groupKey]))];

// //   // Build a map of x (date) -> { region1: y1, region2: y2, ... }
// //   const dateMap = {};

// //   data.forEach(d => {
// //     const xVal = dayjs(d[xKey]);
// //     const yVal = Number(d[yKey]);

// //     if (!xVal.isValid() || isNaN(yVal)) return; // skip invalid points

// //     const x = xVal.format('YYYY-MM-DD');
// //     if (!dateMap[x]) dateMap[x] = { x }; // initialize

// //     dateMap[x][d[groupKey]] = yVal;
// //   });

// //   // Convert map to array for chart
// //   const series = Object.values(dateMap).sort((a, b) => new Date(a.x) - new Date(b.x));

// //   // Assign a color for each region
// //   const colors = ["#1f2937", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
  
// //   return (
// //     <ResponsiveContainer width="100%" height={300}>
// //       <LineChart data={series}>
// //         <XAxis dataKey="x" />
// //         <YAxis tickFormatter={val => (isNaN(val) ? "-" : val)} />
// //         <Tooltip />
// //         <Legend />
// //         {regions.map((region, idx) => (
// //           <Line
// //             key={region}
// //             type="monotone"
// //             dataKey={region}
// //             stroke={colors[idx % colors.length]}
// //             dot={false}
// //           />
// //         ))}
// //       </LineChart>
// //     </ResponsiveContainer>
// //   );
// // }
// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import dayjs from 'dayjs';

// export default function TimeSeriesChart({ data, xKey, yKey, groupKey, title }) {
//   if (!data || data.length === 0) return <div>No data</div>;

//   const regions = [...new Set(data.map(d => d[groupKey]))];
//   const dateMap = {};

//   data.forEach(d => {
//     const xVal = dayjs(d[xKey]);
//     const yVal = Number(d[yKey]);
//     if (!xVal.isValid() || isNaN(yVal)) return;

//     const x = xVal.format('YYYY-MM-DD');
//     if (!dateMap[x]) {
//       dateMap[x] = { x };
//       regions.forEach(r => (dateMap[x][r] = null)); // fill missing regions
//     }
//     dateMap[x][d[groupKey]] = yVal;
//   });

//   const series = Object.values(dateMap).sort((a, b) => new Date(a.x) - new Date(b.x));
//   const colors = ["#1f2937", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

//   return (
//     <div className="bg-white p-4 rounded shadow">
//       <h2 className="font-semibold mb-2">{title}</h2>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={series} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
//           <XAxis dataKey="x" />
//           <YAxis tickFormatter={val => (isNaN(val) ? "-" : val)} />
//           <Tooltip />
//           <Legend />
//           {regions.map((region, idx) => (
//             <Line
//               key={region}
//               type="monotone"
//               dataKey={region}
//               stroke={colors[idx % colors.length]}
//               dot={false}
//             />
//           ))}
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush } from "recharts";
import API from "../../services/api";
import dayjs from "dayjs";
import ChartCard from "./ChartCard";

export default function TimeSeriesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/api/features")
      .then(res => {
        // Use the correct nested data array
        if (res.data && Array.isArray(res.data.data)) {
          setData(res.data.data);
        } else {
          setData([]);
        }
      })
      .catch(err => {
        console.error("Error fetching features for TimeSeriesChart:", err);
        setData([]);
      });
  }, []);

  if (!data || data.length === 0) return <ChartCard title="CPU Usage Over Time (Regions)">No data available</ChartCard>;

  // Determine the metric dynamically
  const metricKey = data[0].usage_cpu !== undefined ? "usage_cpu" : Object.keys(data[0]).find(k => k.includes("cpu")) || "";

  if (!metricKey) return <ChartCard title="CPU Usage Over Time (Regions)">No CPU metric found</ChartCard>;

  const regions = [...new Set(data.map(d => d.region))];
  const dateMap = {};

  data.forEach(d => {
    const xVal = dayjs(d.date);
    const yVal = Number(d[metricKey]);
    if (!xVal.isValid() || isNaN(yVal)) return;

    const x = xVal.format("YYYY-MM-DD");
    if (!dateMap[x]) {
      dateMap[x] = { x };
      regions.forEach(r => (dateMap[x][r] = null)); // fill missing regions
    }
    dateMap[x][d.region] = yVal;
  });

  const series = Object.values(dateMap).sort((a, b) => new Date(a.x) - new Date(b.x));
  const colors = ["#1f2937", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  return (
    <ChartCard title="CPU Usage Over Time (Regions)">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={series} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Brush dataKey="x" height={20} stroke="#8884d8" />
          {regions.map((region, idx) => (
            <Line
              key={region}
              type="monotone"
              dataKey={region}
              stroke={colors[idx % colors.length]}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
