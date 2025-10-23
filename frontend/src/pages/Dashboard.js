import React, { useEffect, useState } from "react";
import API from "../services/api";
import TimeSeriesChart from "../components/charts/TimeSeriesChart";
import Filters from "../components/filters/Filters";
import DataTable from "../components/DataTable";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [regions, setRegions] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedResourceType, setSelectedResourceType] = useState(null);
  const [mode, setMode] = useState("single");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  const resourceTypeToMetric = {
    VM: "usage_cpu",
    Storage: "usage_storage",
    Container: "usage_cpu", // or usage_storage depending on your logic
  };

  useEffect(() => {
    async function fetchFiltersAndDates() {
      try {
        const [regionRes, resourceTypeRes, dateRes] = await Promise.all([
          API.get("/api/features/regions"),
          API.get("/api/features/resource-types"),
          API.get("/api/features/date-range"),
        ]);

        const r = regionRes.data.regions || [];
        setRegions(r);
        if (r.length && !selectedRegion) setSelectedRegion(r[0]);

        const rt = resourceTypeRes.data.resource_types || [];
        setResourceTypes(rt);
        if (rt.length && !selectedResourceType) setSelectedResourceType(rt[0]);

        if (dateRes.data.min_date && dateRes.data.max_date) {
          const minD = new Date(dateRes.data.min_date);
          const maxD = new Date(dateRes.data.max_date);
          setMinDate(minD);
          setMaxDate(maxD);
          setStartDate((prev) => prev || minD);
          setEndDate((prev) => prev || maxD);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load filters or date range");
      }
    }
    fetchFiltersAndDates();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate || !selectedRegion || !selectedResourceType) return;

      try {
        setLoading(true);

        let url = `/api/features?page=1&page_size=500`;
        url += `&region=${encodeURIComponent(selectedRegion)}`;
        url += `&resource_type=${encodeURIComponent(selectedResourceType)}`;
        url += `&start_date=${startDate.toISOString().split("T")[0]}`;
        url += `&end_date=${endDate.toISOString().split("T")[0]}`;

        const res = await API.get(url);
        const rows = res.data?.data || [];

        const cleanedRows = rows.map((r) => ({
          ...r,
          usage_cpu: r.usage_cpu ?? 0,
          usage_storage: r.usage_storage ?? 0,
          users_active: r.users_active ?? 0,
          cpu_lag_1: r.cpu_lag_1 ?? 0,
          cpu_lag_3: r.cpu_lag_3 ?? 0,
          cpu_lag_7: r.cpu_lag_7 ?? 0,
          cpu_roll_mean_7: r.cpu_roll_mean_7 ?? 0,
          cpu_roll_mean_30: r.cpu_roll_mean_30 ?? 0,
        }));

        setData(cleanedRows);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedRegion, selectedResourceType, startDate, endDate]);

  const filteredData = data.filter((d) => {
    const rowDate = new Date(d.date);
    const inRegion = selectedRegion
      ? d.region?.trim().toLowerCase() === selectedRegion.trim().toLowerCase()
      : true;
    const inDateRange =
      startDate && endDate ? rowDate >= startDate && rowDate <= endDate : true;
    return inRegion && inDateRange;
  });

  const yKey = resourceTypeToMetric[selectedResourceType] || "usage_cpu";

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <Filters
          regions={regions}
          resourceTypes={resourceTypes}
          selectedRegion={selectedRegion}
          selectedResourceType={selectedResourceType}
          onRegionChange={setSelectedRegion}
          onResourceTypeChange={setSelectedResourceType}
          mode={mode}
          onModeChange={setMode}
          startDate={startDate}
          endDate={endDate}
          minDate={minDate}
          maxDate={maxDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      <section className="bg-white p-4 rounded shadow">
        {loading ? (
          <p>Loading...</p>
        ) : filteredData.length === 0 ? (
          <p>No data available for selected filters.</p>
        ) : (
          <TimeSeriesChart
            data={filteredData}
            xKey="date"
            yKey={yKey}
            groupKey="region"
            title="Time Series Trend"
          />
        )}
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Data Table</h3>
        {loading ? <p>Loading...</p> : <DataTable data={filteredData} />}
      </section>
    </div>
  );
}
