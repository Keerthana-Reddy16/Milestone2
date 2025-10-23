import React from "react";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

export default function FeatureTable({ data, loading }) {
  if (loading) return <div>Loading...</div>;
  if (!data || data.length === 0) return <div>No data</div>;

  const cols = Object.keys(data[0]).slice(0, 12);

  const handleDownload = () => {
    try {
      const csvHeader = cols.join(",") + "\n";
      const csvRows = data
        .map((row) => cols.map((c) => JSON.stringify(row[c] ?? "")).join(","))
        .join("\n");
      const blob = new Blob([csvHeader + csvRows], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, "feature_data.csv");
      toast.success("✅ CSV downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to export CSV");
    }
  };

  return (
    <div className="overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Feature Table</h3>
        <button
          onClick={handleDownload}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>
      <table className="min-w-full text-left border rounded">
        <thead className="bg-slate-100">
          <tr>
            {cols.map((c) => (
              <th key={c} className="p-2 text-sm border-b">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 50).map((row, i) => (
            <tr key={i} className={i % 2 ? "bg-white" : "bg-slate-50"}>
              {cols.map((c) => (
                <td key={c} className="p-2 text-sm border-b">
                  {String(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
