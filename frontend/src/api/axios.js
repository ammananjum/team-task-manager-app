import axios from "axios";

const api = axios.create({
  baseURL: "https://backendzip--azoha7945.replit.app",
  withCredentials: true,
});

export default api;
