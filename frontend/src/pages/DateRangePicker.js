import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateRangePicker({ data, onDateChange }) {
  // Parse dataset dates into JS Date objects
  const dates = data.map(item => new Date(item.date));

  // Determine min and max from dataset
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);

  // Trigger callback when dates change
  useEffect(() => {
    onDateChange({ startDate, endDate });
  }, [startDate, endDate]);

  return (
    <div className="flex gap-4">
      <div>
        <label>Start Date:</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          minDate={minDate}
          maxDate={endDate}
          dateFormat="yyyy-MM-dd"
        />
      </div>

      <div>
        <label>End Date:</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          maxDate={maxDate}
          dateFormat="yyyy-MM-dd"
        />
      </div>
    </div>
  );
}
