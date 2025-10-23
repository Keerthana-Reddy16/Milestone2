import React from "react";

function DownloadReport({ reportData }) {
  const handleDownload = () => {
    const rows = [
      ["Model", "MAPE", "RMSE", "Bias"],
      ...Object.entries(reportData.accuracy_metrics || {}).map(([model, stats]) => [
        model,
        stats.MAPE,
        stats.RMSE,
        stats.Bias || "-"
      ])
    ];

    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "forecast_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleDownload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download Forecast Report (CSV)
      </button>
    </div>
  );
}

export default DownloadReport;