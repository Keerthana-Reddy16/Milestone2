import React from "react";

function RiskIndicator({ forecastDemand, availableCapacity }) {
  let color = "green";
  if (forecastDemand > availableCapacity) {
    color = "red";
  } else if (forecastDemand < availableCapacity * 0.8) {
    color = "yellow";
  }

  const label = {
    green: "🟢 Sufficient",
    yellow: "🟡 Over-provisioned",
    red: "🔴 Shortage"
  };

  return (
    <div className="mt-2 text-sm font-medium">
      Risk Level: <span className={`text-${color}-600`}>{label[color]}</span>
    </div>
  );
}

export default RiskIndicator;