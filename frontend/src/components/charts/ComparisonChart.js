// import React from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import ChartCard from "./ChartCard";

// export default function ComparisonChart({ data }) {
//   if (!Array.isArray(data) || data.length === 0) 
//     return <div style={{ minHeight: 300 }}>No data available</div>;

//   // Aggregate by region safely
//   const aggregated = data.reduce((acc, d) => {
//     const region = d.region || "Unknown";

//     // Initialize region if not exists
//     if (!acc[region]) {
//       acc[region] = { region, cpu_before: 0, cpu_after: 0, storage_before: 0, storage_after: 0, count: 0 };
//     }

//     // Parse numeric values safely
//     const cpuBefore = parseFloat(d.cpu_roll_mean_7) || 0;
//     const cpuAfter = parseFloat(d.usage_cpu) || 0;
//     const storageBefore = parseFloat(d.storage_efficiency) || 0;
//     const storageAfter = parseFloat(d.usage_storage) || 0;

//     acc[region].cpu_before += cpuBefore;
//     acc[region].cpu_after += cpuAfter;
//     acc[region].storage_before += storageBefore;
//     acc[region].storage_after += storageAfter;
//     acc[region].count += 1;

//     return acc;
//   }, {});

//   // Convert aggregated sums to averages
//   const chartData = Object.values(aggregated).map(r => ({
//     region: r.region,
//     cpu_before: r.count ? r.cpu_before / r.count : 0,
//     cpu_after: r.count ? r.cpu_after / r.count : 0,
//     storage_before: r.count ? r.storage_before / r.count : 0,
//     storage_after: r.count ? r.storage_after / r.count : 0,
//   }));

//   console.log("Aggregated chartData:", chartData); // Debugging

//   return (
//     <ChartCard title="CPU & Storage Before vs After Feature Engineering">
//       <div style={{ minHeight: 300 }}>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={chartData}>
//             <XAxis dataKey="region" />
//             <YAxis />
//             <Tooltip formatter={val => (typeof val === "number" ? val.toFixed(2) : val)} />
//             <Legend />
//             <Bar dataKey="cpu_before" fill="#3b82f6" name="CPU Before" />
//             <Bar dataKey="cpu_after" fill="#ef4444" name="CPU After" />
//             <Bar dataKey="storage_before" fill="#10b981" name="Storage Before" />
//             <Bar dataKey="storage_after" fill="#f59e0b" name="Storage After" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </ChartCard>
//   );
// }
// import React from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import ChartCard from "./ChartCard";

// export default function ComparisonChart() {
//   // Hardcoded numeric data
//   const chartData = [
//     {
//       region: "East US",
//       cpu_before: 15,
//       cpu_after: 35,
//       storage_before: 50,
//       storage_after: 70,
//     },
//     {
//       region: "West US",
//       cpu_before: 20,
//       cpu_after: 40,
//       storage_before: 60,
//       storage_after: 80,
//     },
//     {
//       region: "Southeast Asia",
//       cpu_before: 10,
//       cpu_after: 30,
//       storage_before: 45,
//       storage_after: 65,
//     },
//     {
//       region: "North Europe",
//       cpu_before: 25,
//       cpu_after: 55,
//       storage_before: 70,
//       storage_after: 90,
//     },
//   ];

//   return (
//     <ChartCard title="CPU & Storage Before vs After Feature Engineering ">
//       <div style={{ minHeight: 300 }}>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={chartData}>
//             <XAxis dataKey="region" />
//             <YAxis />
//             <Tooltip formatter={val => (typeof val === "number" ? val.toFixed(2) : val)} />
//             <Legend />
//             <Bar dataKey="cpu_before" fill="#3b82f6" name="CPU Before" />
//             <Bar dataKey="cpu_after" fill="#ef4444" name="CPU After" />
//             <Bar dataKey="storage_before" fill="#10b981" name="Storage Before" />
//             <Bar dataKey="storage_after" fill="#f59e0b" name="Storage After" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </ChartCard>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import ChartCard from "./ChartCard";
import API from "../../services/api";
import { toast } from "react-toastify";

function aggregateByRegion(data) {
  const grouped = {};

  data.forEach((row) => {
    const region = row.region;
    if (!grouped[region]) {
      grouped[region] = {
        region,
        cpu_before: 0,
        cpu_after: 0,
        storage_before: 0,
        storage_after: 0,
        count: 0,
      };
    }
    grouped[region].cpu_before += row.cpu_before;
    grouped[region].cpu_after += row.cpu_after;
    grouped[region].storage_before += row.storage_before;
    grouped[region].storage_after += row.storage_after;
    grouped[region].count += 1;
  });

  return Object.values(grouped).map((group) => ({
    region: group.region,
    cpu_before: group.cpu_before / group.count,
    cpu_after: group.cpu_after / group.count,
    storage_before: group.storage_before / group.count,
    storage_after: group.storage_after / group.count,
  }));
}

export default function ComparisonChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComparisonData() {
      try {
        const res = await API.get("/api/insights");
//console.log("Raw comparison data:", res.data?.comparison);
const rawData = res.data?.comparison || [];

        const aggregated = aggregateByRegion(rawData);
        //console.log("Aggregated Chart Data:", aggregated); // ✅ Debug log
        setChartData(aggregated);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load comparison data");
      } finally {
        setLoading(false);
      }
    }
    fetchComparisonData();
  }, []);

  return (
    <ChartCard title="CPU & Storage Usage: Before vs After Feature Engineering">
      <div style={{ minHeight: 350 }}>
        {loading ? (
          <p>Loading...</p>
        ) : chartData.length === 0 ? (
          <p>No comparison data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              barGap={8}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                formatter={(val, name) =>
                  [`${val.toFixed(2)}`, name.replace("_", " ").toUpperCase()]
                }
              />
              <Legend verticalAlign="top" height={36} />

              {/* CPU Group */}
              <Bar dataKey="cpu_before" fill="#3b82f6" name="CPU Before" stackId="cpu" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="cpu_before" position="top" formatter={(val) => val.toFixed(1)} />
              </Bar>
              <Bar dataKey="cpu_after" fill="#ef4444" name="CPU After" stackId="cpu" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="cpu_after" position="top" formatter={(val) => val.toFixed(1)} />
              </Bar>

              {/* Storage Group */}
              <Bar dataKey="storage_before" fill="#10b981" name="Storage Before" stackId="storage" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="storage_before" position="top" formatter={(val) => val.toFixed(1)} />
              </Bar>
              <Bar dataKey="storage_after" fill="#f59e0b" name="Storage After" stackId="storage" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="storage_after" position="top" formatter={(val) => val.toFixed(1)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
