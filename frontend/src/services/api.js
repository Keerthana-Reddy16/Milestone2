import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8000",
});

// Forecast API with model support
export const getForecast = async (params) => {
  const response = await API.get("/api/forecast", { params }); // ✅ CORRECT
  return response.data.forecast || []; // or response.data if you're using full payload
};



// Monitoring API
export const getMonitoringStatus = async () => {
  const response = await API.get("/api/monitoring");
  return response.data;
};

// Report API
export const getSummaryReport = async () => {
  const response = await API.get("/api/report");
  return response.data;
};

// Model Comparison API
export const getModelComparison = () => API.get("/api/model-comparison");

export default API;

//capacity planning 
export const getCapacityAdjustment = async (params) => {
  const response = await API.get("/api/capacity-adjustment", { params });
  return response.data;
};