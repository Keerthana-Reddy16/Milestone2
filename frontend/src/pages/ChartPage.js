// import React, { useState, useEffect } from "react";
// import ComparisonChart from "../components/charts/ComparisonChart";
// import HeatmapChart from "../components/charts/HeatmapChart";
// import PeakUsageChart from "../components/charts/PeakUsageChart";
// import SeasonalityChart from "../components/charts/SeasonalityChart";
// import TimeSeriesChart from "../components/charts/TimeSeriesChart";
// import DayOfWeekBoxplot from "../components/charts/DayOfWeekBoxplot";
// import RegionalBoxplot from "../components/charts/RegionalBoxplot";
// import API from "../services/api";

// export default function ChartPage() {
//   const [selectedChart, setSelectedChart] = useState("comparison");
//   const [chartData, setChartData] = useState({});

//   useEffect(() => {
//     API.get("/api/chart-data")
//       .then(res => setChartData(res.data))
//       .catch(err => {
//         console.error("Error fetching chart data:", err);
//         setChartData({});
//       });
//   }, []);

//   const chartOptions = {
//     comparison: {
//       label: "Comparison Chart",
//       description: "Compare CPU and Storage usage before vs after feature engineering.",
//       component: <ComparisonChart data={chartData.comparison || []} />,
//     },
//     heatmap: {
//       label: "Heatmap Chart",
//       description: "Correlation heatmap between engineered features and usage.",
//       component: <HeatmapChart data={chartData.heatmap || []} />,
//     },
//     peak: {
//       label: "Peak Usage Chart",
//       description: "Visualize peak CPU/Storage demand times.",
//       component: <PeakUsageChart data={chartData.peak_usage || []} />,
//     },
//     seasonality: {
//       label: "Seasonality Chart",
//       description: "Monthly and weekly seasonal usage patterns.",
//       component: <SeasonalityChart data={chartData.seasonality || []} />,
//     },
//     timeseries: {
//       label: "Time Series Chart",
//       description: "Time-series trends of CPU and Storage demand.",
//       component: <TimeSeriesChart data={chartData.timeseries || []} />,
//     },
//     dayofweek: {
//       label: "Day of Week Boxplot",
//       description: "Boxplot of usage variation by day of week.",
//       component: <DayOfWeekBoxplot data={chartData.day_of_week || []} />,
//     },
//     regional: {
//       label: "Regional Boxplot",
//       description: "Boxplot showing variation in demand across regions.",
//       component: <RegionalBoxplot data={chartData.regional || []} />,
//     },
//   };

//   return (
//     <div className="space-y-6">
//       {/* Dropdown */}
//       <div className="flex items-center gap-4">
//         <label className="font-semibold">Select Chart:</label>
//         <select
//           value={selectedChart}
//           onChange={e => setSelectedChart(e.target.value)}
//           className="border rounded px-3 py-2"
//         >
//           {Object.entries(chartOptions).map(([key, option]) => (
//             <option key={key} value={key}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Chart Description */}
//       <p className="text-gray-600 italic">{chartOptions[selectedChart].description}</p>

//       {/* Render Chart */}
//       <div className="p-4 bg-white rounded shadow">
//         {chartOptions[selectedChart].component}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import ComparisonChart from "../components/charts/ComparisonChart";
import HeatmapChart from "../components/charts/HeatmapChart";
import PeakUsageChart from "../components/charts/PeakUsageChart";
import SeasonalityChart from "../components/charts/SeasonalityChart";
import TimeSeriesChart from "../components/charts/TimeSeriesChart";
import DayOfWeekBoxplot from "../components/charts/DayOfWeekBoxplot";
import RegionalBoxplot from "../components/charts/RegionalBoxplot";
import API from "../services/api";

export default function ChartPage() {
  const [selectedChart, setSelectedChart] = useState("comparison");
  const [featuresData, setFeaturesData] = useState([]);
  const [chartData, setChartData] = useState({
    comparison: [],
    heatmap: [],
    peak_usage: [],
    seasonality: [],
    time_series: [],
    day_of_week_stats: [],
    regional_stats: [],
  });

 useEffect(() => {
  // Fetch features data
  API.get("/api/features")
    .then((res) => {
      const features = res.data.data || [];
      setFeaturesData(features);

      // Compute fallback chart data from features
      const fallbackComparison = features.map((d) => ({
        region: d.region,
        cpu_before: d.cpu_roll_mean_7 ?? 0,
        cpu_after: d.usage_cpu ?? 0,
        storage_before: d.storage_efficiency ?? 0,
        storage_after: d.usage_storage ?? 0,
      }));

      const fallbackSeasonality = features.map((d) => ({
        month: d.month,
        cpu_usage: d.usage_cpu,
        storage_usage: d.usage_storage,
      }));

      const fallbackTimeSeries = features.map((d) => ({
        date: d.date,
        region: d.region,
        cpu_usage: d.usage_cpu,
      }));

      const fallbackDayOfWeek = features.map((d) => ({
        day: d.day_of_week,
        min: d.usage_cpu,
        max: d.usage_cpu,
        median: d.usage_cpu,
      }));

      setChartData((prev) => ({
        comparison: prev.comparison?.length ? prev.comparison : fallbackComparison,
        seasonality: prev.seasonality?.length ? prev.seasonality : fallbackSeasonality,
        time_series: prev.time_series?.length ? prev.time_series : fallbackTimeSeries,
        day_of_week_stats: prev.day_of_week_stats?.length ? prev.day_of_week_stats : fallbackDayOfWeek,
        heatmap: prev.heatmap || [],
        peak_usage: prev.peak_usage || [],
        regional_stats: prev.regional_stats || [],
      }));
    })
    .catch((err) => {
      console.error("Error fetching features:", err);
      setFeaturesData([]);
    });

  // Fetch insights data
  API.get("/api/insights")
    .then((res) => {
      const backendData = res.data.chart_data || {};
      setChartData((prev) => ({
        comparison: backendData.comparison?.length ? backendData.comparison : prev.comparison,
        seasonality: backendData.seasonality?.length ? backendData.seasonality : prev.seasonality,
        time_series: backendData.time_series?.length ? backendData.time_series : prev.time_series,
        day_of_week_stats: backendData.day_of_week_stats?.length ? backendData.day_of_week_stats : prev.day_of_week_stats,
        heatmap: backendData.heatmap?.length ? backendData.heatmap : prev.heatmap,
        peak_usage: backendData.peak_usage?.length ? backendData.peak_usage : prev.peak_usage,
        regional_stats: backendData.regional_stats?.length ? backendData.regional_stats : prev.regional_stats,
      }));
    })
    .catch((err) => {
      console.error("Error fetching insights chart data:", err);
    });
}, []);



  const chartOptions = {
  comparison: {
    label: "Comparison Chart",
    description: "Compare CPU and Storage usage before vs after feature engineering.",
    component: (
      <ComparisonChart
        data={Array.isArray(chartData.comparison) ? chartData.comparison : []}
      />
    ),
  },
  heatmap: {
    label: "Heatmap Chart",
    description: "Correlation heatmap between engineered features and usage.",
    component: (
      <HeatmapChart
        data={Array.isArray(featuresData) ? featuresData : []}
      />
    ),
  },
  peak: {
    label: "Peak Usage Chart",
    description: "Visualize peak CPU/Storage demand times.",
    component: (
      <PeakUsageChart
        data={Array.isArray(chartData.peak_usage) ? chartData.peak_usage : []}
      />
    ),
  },
  seasonality: {
    label: "Seasonality Chart",
    description: "Monthly and weekly seasonal usage patterns.",
    component: (
      <SeasonalityChart
        data={Array.isArray(chartData.seasonality) ? chartData.seasonality : []}
      />
    ),
  },
  timeseries: {
    label: "Time Series Chart",
    description: "Time-series trends of CPU and Storage demand.",
    component: (
      <TimeSeriesChart
        data={Array.isArray(chartData.time_series) ? chartData.time_series : []}
      />
    ),
  },
  dayofweek: {
    label: "Day of Week Boxplot",
    description: "Boxplot of usage variation by day of week.",
    component: (
      <DayOfWeekBoxplot
        data={Array.isArray(chartData.day_of_week_stats) ? chartData.day_of_week_stats : []}
      />
    ),
  },
  regional: {
    label: "Regional Boxplot",
    description: "Boxplot showing variation in demand across regions.",
    component: (
      <RegionalBoxplot
        data={Array.isArray(chartData.regional_stats) ? chartData.regional_stats : []}
      />
    ),
  },
};


  return (
    <div className="space-y-6">
      {/* Dropdown */}
      <div className="flex items-center gap-4">
        <label className="font-semibold">Select Chart:</label>
        <select
          value={selectedChart}
          onChange={(e) => setSelectedChart(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {Object.entries(chartOptions).map(([key, option]) => (
            <option key={key} value={key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chart Description */}
      <p className="text-gray-600 italic">{chartOptions[selectedChart].description}</p>

      {/* Render Chart */}
      <div className="p-4 bg-white rounded shadow">
        {chartOptions[selectedChart].component}
      </div>
    </div>
  );
}

