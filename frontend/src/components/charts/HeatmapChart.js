// import React from "react";
// import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from "recharts";
// import ChartCard from "./ChartCard";

// export default function HeatmapChart({ data }) {
//   if (!Array.isArray(data) || data.length === 0) return <div>No data available</div>;

//   const colorScale = val => {
//     if (val > 80) return "#ef4444";
//     if (val > 50) return "#f59e0b";
//     return "#3b82f6";
//   };

//   return (
//     <ChartCard title="Feature Correlation Heatmap">
//       <ResponsiveContainer width="100%" height={300}>
//         <ScatterChart>
//           <XAxis dataKey="feature1" type="category" />
//           <YAxis dataKey="feature2" type="category" />
//           <ZAxis dataKey="correlation" range={[0, 100]} />
//           <Tooltip formatter={val => (typeof val === "number" ? val.toFixed(2) : val)} />
//           <Scatter data={data}>
//             {data.map((d, i) => (
//               <Cell key={`cell-${i}`} fill={colorScale(d.correlation)} />
//             ))}
//           </Scatter>
//         </ScatterChart>
//       </ResponsiveContainer>
//     </ChartCard>
//   );
// }
import React, { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import API from "../../services/api";
import { toast } from "react-toastify";

export default function HeatmapChart() {
  const [matrix, setMatrix] = useState([]);
  const [features, setFeatures] = useState([]);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    async function fetchCorrelations() {
      try {
        const res = await API.get("/api/insights");
        const corr = res.data?.correlations || {};
        const featureList = Object.keys(corr);
        const grid = [];
        const strongPairs = [];

        featureList.forEach((rowFeature) => {
          const row = [];
          featureList.forEach((colFeature) => {
            const value = corr[rowFeature]?.[colFeature];
            if (
              value !== null &&
              typeof value === "number" &&
              rowFeature !== colFeature
            ) {
              if (Math.abs(value) > 0.8) {
                strongPairs.push(`${rowFeature} ↔ ${colFeature} (${value.toFixed(2)})`);
              }
            }
            row.push({
              x: colFeature,
              y: rowFeature,
              value: value !== null && typeof value === "number" ? value : null,
            });
          });
          grid.push(row);
        });

        setFeatures(featureList);
        setMatrix(grid);

        if (strongPairs.length > 0) {
          setSummary(
            `Strong correlations detected between: ${strongPairs.join(", ")}. These relationships may indicate redundancy or strong dependency between features.`
          );
        } else {
          setSummary("No strong correlations detected. Feature relationships appear weak or independent.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load correlation data");
      }
    }

    fetchCorrelations();
  }, []);

  const getColor = (val) => {
    if (val === null) return "#e5e7eb"; // gray for missing
    const intensity = Math.abs(val); // 0 to 1
    if (intensity > 0.8) return "#ef4444"; // strong
    if (intensity > 0.5) return "#f59e0b"; // moderate
    return "#3b82f6"; // weak
  };

  return (
    <ChartCard title="Feature Correlation Heatmap">
      {/* Responsive Grid */}
      <div style={{ width: "100%", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `120px repeat(${features.length}, 1fr)`,
            width: "100%",
          }}
        >
          {/* Header Row */}
          <div></div>
          {features.map((f) => (
            <div
              key={`header-${f}`}
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: "bold",
                padding: "6px 4px",
                borderBottom: "1px solid #ccc",
              }}
            >
              {f}
            </div>
          ))}

          {/* Grid Rows */}
          {matrix.map((row, i) => (
            <React.Fragment key={i}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  textAlign: "right",
                  padding: "6px 4px",
                  borderRight: "1px solid #ccc",
                }}
              >
                {features[i]}
              </div>
              {row.map((cell, j) => (
                <div
                  key={`${cell.x}-${cell.y}`}
                  style={{
                    backgroundColor: getColor(cell.value),
                    color: "#fff",
                    textAlign: "center",
                    fontSize: 12,
                    padding: "6px 4px",
                    border: "1px solid #fff",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {cell.value !== null ? cell.value.toFixed(2) : "-"}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div style={{ marginTop: "1rem", fontSize: "14px", color: "#374151" }}>
        <strong>Conclusion:</strong> {summary}
      </div>

      {/* Color Code Explanation */}
      <div style={{ marginTop: "0.75rem", fontSize: "13px", color: "#4b5563" }}>
        <strong>Color Legend:</strong><br />
        <span style={{ color: "#ef4444", fontWeight: "bold" }}>Red</span> = Strong correlation (above 0.80)<br />
        <span style={{ color: "#f59e0b", fontWeight: "bold" }}>Orange</span> = Moderate correlation (0.50 – 0.80)<br />
        <span style={{ color: "#3b82f6", fontWeight: "bold" }}>Blue</span> = Weak correlation (below 0.50)<br />
        <span style={{ color: "#6b7280" }}>Gray</span> = No data or self-correlation
      </div>
    </ChartCard>
  );
}
