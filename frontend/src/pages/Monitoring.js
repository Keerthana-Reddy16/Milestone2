import React, { useEffect, useState } from "react";
import { getMonitoringStatus} from "../services/api.js" // ✅ Use your API wrapper
import MonitoringDashboard from "../components/MonitoringDashboard";
import DownloadReport from "../components/DownloadReport";

function Monitoring() {
  const [metrics, setMetrics] = useState({});
  const [drift, setDrift] = useState(false);
  const [lastRetrain, setLastRetrain] = useState("");

  useEffect(() => {
    async function fetchMonitoring() {
      try {
        const res = await getMonitoringStatus(); // ✅ Use wrapper
        setMetrics(res.metrics);
        setDrift(res.error_drift);
        setLastRetrain(res.last_train_date || "Unknown");
      } catch (err) {
        console.error("Monitoring API error:", err);
      }
    }

    fetchMonitoring();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <MonitoringDashboard
        metrics={metrics}
        drift={drift}
        lastRetrain={lastRetrain}
      />
      <DownloadReport reportData={{ accuracy_metrics: metrics }} />
    </div>
  );
}

export default Monitoring;