import React from 'react';

export default function KPICards({ data }) {
  if (!data) return <div>Loading...</div>;

  const cards = [
    { title: 'Peak CPU Usage', value: `${(data.peak_cpu*100).toFixed(1)}%` },
    { title: 'Top Region', value: data.top_region },
    { title: 'Utilization Ratio', value: (data.utilization*100).toFixed(1) + '%' },
    { title: 'Storage Efficiency', value: (data.storage_efficiency*100).toFixed(1) + '%' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.title} className="bg-white p-4 rounded shadow flex flex-col justify-center items-center">
          <h3 className="text-gray-500">{c.title}</h3>
          <span className="text-xl font-bold text-blue-700">{c.value}</span>
        </div>
      ))}
    </div>
  );
}
