import React from "react";

export default function Header() {
  return (
    <header className="w-full bg-white shadow px-6 py-3 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Azure Capacity Planning</h2>
      <span className="text-sm text-gray-500">{new Date().toDateString()}</span>
    </header>
  );
}
