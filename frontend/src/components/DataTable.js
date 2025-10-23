import React from "react";

export default function DataTable({ data }) {
  if (!data || !data.length) return <p className="text-gray-500">No data to display</p>;

  // Get table headers from keys of first row
  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-300 rounded">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 border-b text-left text-sm font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {headers.map((header) => (
                <td key={header} className="px-3 py-1 border-b text-sm">
                  {row[header] !== null ? row[header] : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
