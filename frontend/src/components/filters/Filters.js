import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Filters({
  regions,
  resourceTypes,
  selectedRegion,
  selectedResourceType,
  onRegionChange,
  onResourceTypeChange,
  mode,
  onModeChange,
  startDate,
  endDate,
  minDate,
  maxDate,
  onStartDateChange,
  onEndDateChange
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      
      {/* Region Selector */}
      <div>
        <label className="block font-semibold mb-1">Region</label>
        <select
          value={selectedRegion || ""}
          onChange={(e) => onRegionChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Select Region</option>
          {(Array.isArray(regions) ? regions : []).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Resource Type Selector */}
      <div>
        <label className="block font-semibold mb-1">Resource Type</label>
        <select
          value={selectedResourceType || ""}
          onChange={(e) => onResourceTypeChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Select Resource Type</option>
          {(Array.isArray(resourceTypes) ? resourceTypes : []).map((rt) => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>
      </div>

      {/* Mode Selector */}
      <div>
        <label className="block font-semibold mb-1">Mode</label>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="single">Single Date</option>
          <option value="range">Date Range</option>
        </select>
      </div>

      {/* Single Date Picker */}
      {mode === "single" && (
        <div>
          <label className="block font-semibold mb-1">Select Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              if (!date) return;
              if (date < minDate) date = minDate;
              if (date > maxDate) date = maxDate;
              onStartDateChange(date);
            }}
            minDate={minDate}
            maxDate={maxDate}
            dateFormat="yyyy-MM-dd"
            className="border rounded px-2 py-1"
          />
        </div>
      )}

      {/* Range Date Pickers */}
      {mode === "range" && (
        <div className="flex gap-2">
          <div>
            <label className="block font-semibold mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                if (!date) return;
                if (date < minDate) date = minDate;
                if (date > (endDate || maxDate)) date = endDate || maxDate;
                onStartDateChange(date);
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={minDate}
              maxDate={endDate || maxDate}
              dateFormat="yyyy-MM-dd"
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                if (!date) return;
                if (date > maxDate) date = maxDate;
                if (date < (startDate || minDate)) date = startDate || minDate;
                onEndDateChange(date);
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || minDate}
              maxDate={maxDate}
              dateFormat="yyyy-MM-dd"
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
