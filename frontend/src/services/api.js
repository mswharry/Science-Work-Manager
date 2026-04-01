import axios from "axios";
import { API_BASE_URL, STORAGE_TOKEN_KEY } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    config.headers = config.headers || {};
    config.headers.Accept = "application/json";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && localStorage.getItem(STORAGE_TOKEN_KEY)) {
      window.dispatchEvent(new CustomEvent("swm:unauthorized"));
    }

    return Promise.reject(error);
  },
);

export default api;
