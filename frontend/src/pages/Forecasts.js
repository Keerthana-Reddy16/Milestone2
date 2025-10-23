import React, { useState, useEffect } from "react";
import ForecastFilters from "../components/filters/ForecastFilters.js";
import ForecastChart from "../components/charts/ForecastChart.js";
import { getForecast } from "../services/api.js";
import { toast } from "react-toastify";
import HistoricalFilters from "../components/filters/HistoricalFilters.js";

function Forecasts() {
  // Historical filters
  const [historicalRegion, setHistoricalRegion] = useState("East US");
  const [historicalService, setHistoricalService] = useState("VM");
  const [historicalModel, setHistoricalModel] = useState("xgboost");
  const [historicalHorizon, setHistoricalHorizon] = useState(7);
  //const [startDate, setStartDate] = useState("");
  //const [endDate, setEndDate] = useState("");

  // Forecast filters
  const [forecastRegion, setForecastRegion] = useState("East US");
  const [forecastService, setForecastService] = useState("VM");
  const [forecastModel, setForecastModel] = useState("xgboost");
  const [forecastHorizon, setForecastHorizon] = useState(30);

  // Data
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Fetch historical data
  // Update historical fetch logic
useEffect(() => {
  async function fetchHistorical() {
    setLoadingHistorical(true);
    try {
      const res = await getForecast({
        region: historicalRegion,
        service: historicalService,
        model: historicalModel,
        horizon: historicalHorizon, // ✅ only horizon
      });
      setHistoricalData(res);
    } catch (err) {
      toast.error("Error fetching historical data");
      setHistoricalData([]);
    } finally {
      setLoadingHistorical(false);
    }
  }
  fetchHistorical();
}, [historicalRegion, historicalService, historicalModel, historicalHorizon]);

  // Fetch forecast-only data
  useEffect(() => {
    async function fetchForecast() {
      setLoadingForecast(true);
      try {
        const res = await getForecast({
          region: forecastRegion,
          service: forecastService,
          model: forecastModel,
          horizon: forecastHorizon,
        });
        const forecast = res.filter(row => row.actual === null && row.predicted !== null);
        setForecastData(forecast);
      } catch (err) {
        toast.error("Error fetching forecast");
        setForecastData([]);
      } finally {
        setLoadingForecast(false);
      }
    }
    fetchForecast();
  }, [forecastRegion, forecastService, forecastModel, forecastHorizon]);

  return (
    <div className="space-y-10 p-6">
      {/* Historical Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">📊 Historical vs Predicted</h2>
        <HistoricalFilters
          region={historicalRegion}
          service={historicalService}
          model={historicalModel}
          horizon={historicalHorizon}
          // startDate={startDate}
          // endDate={endDate}
          onRegionChange={setHistoricalRegion}
          onServiceChange={setHistoricalService}
          onModelChange={setHistoricalModel}
          onHorizonChange={setHistoricalHorizon}
        />
        {loadingHistorical && <p>Loading historical data...</p>}
        {!loadingHistorical && historicalData.length > 0 && (
          <ForecastChart title="Historical vs Predicted" data={historicalData} />
        )}
      </section>

      {/* Forecast Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">🔮 Forecast Explorer</h2>
        <ForecastFilters
          region={forecastRegion}
          service={forecastService}
          model={forecastModel}
          horizon={forecastHorizon}
          onRegionChange={setForecastRegion}
          onServiceChange={setForecastService}
          onModelChange={setForecastModel}
          onHorizonChange={setForecastHorizon}
        />
        {loadingForecast && <p>Loading forecast data...</p>}
        {!loadingForecast && forecastData.length > 0 && (
          <ForecastChart title="Forecasted Usage" data={forecastData} />
        )}
      </section>
    </div>
  );
}

export default Forecasts;