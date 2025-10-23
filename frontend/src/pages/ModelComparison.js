import React, { useEffect, useState } from "react";
import ModelComparisonTable from "../components/tables/ModelComparisonTable";
import { getModelComparison } from "../services/api";
import { toast } from "react-toastify";

function ModelComparison() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async () => {
    try {
      const res = await getModelComparison();
      setMetrics(res.data);
    } catch (err) {
      toast.error("Failed to load model comparison");
    } finally {
      setLoading(false);
    }
  };

  const retrainModels = async () => {
    try {
      await fetch("http://localhost:8000/api/model-comparison/train-all", {
        method: "POST",
      });
      toast.success("Models retrained successfully");
      fetchComparison();
    } catch (err) {
      toast.error("Retraining failed");
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
        Model Comparison
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ModelComparisonTable data={metrics} onRetrain={retrainModels} />
      )}
    </div>
  );
}

export default ModelComparison;