import axios from "axios";
import { message } from "antd";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Create axios instance with better defaults
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 second timeout
});

// Add request interceptor to automatically add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data || ""
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Track retry attempts
const retryStorage = new Map();
const MAX_RETRIES = 2;

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.status);
    // Clear retry count on successful response
    if (response.config.url) {
      retryStorage.delete(response.config.url);
    }
    return response;
  },
  async (error) => {
    // Get request URL for tracking retries
    const requestUrl = error.config?.url || "";
    const currentRetry = retryStorage.get(requestUrl) || 0;

    // Track retry attempts
    if (currentRetry < MAX_RETRIES) {
      retryStorage.set(requestUrl, currentRetry + 1);
    }

    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error(`API Error ${error.response.status}:`, error.response.data);

      if (error.response.status === 401) {
        // Check if we have a token
        const hasToken = !!localStorage.getItem("token");

        if (hasToken && currentRetry === 0) {
          // Notify user about authentication issue
          message.error("Your session has expired. Please login again.");
          // Clear the invalid token
          localStorage.removeItem("token");

          // Redirect to login page
          if (
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register"
          ) {
            window.location.href = "/login";
          }
        } else if (!hasToken || currentRetry >= MAX_RETRIES) {
          // Fall back to demo mode after retries
          localStorage.setItem("token", "demo-token-for-bypassing-auth");
          console.log("Switched to demo token due to auth error");
          message.info("Using demo mode due to authentication issues");

          // Retry the request with the demo token
          const originalRequest = error.config;
          originalRequest.headers["Authorization"] =
            "Bearer demo-token-for-bypassing-auth";
          return axios(originalRequest);
        }
      } else if (error.response.status === 500 && currentRetry < MAX_RETRIES) {
        // Automatically retry server errors
        const backoffTime = Math.pow(2, currentRetry) * 1000; // Exponential backoff
        console.log(
          `Retrying request after ${backoffTime}ms (attempt ${
            currentRetry + 1
          }/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return axios(error.config);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("API no response:", error.request);
      message.error("Cannot connect to server. Using offline mode.");

      // For network errors, use demo token if not already retried
      if (currentRetry < MAX_RETRIES) {
        const backoffTime = Math.pow(2, currentRetry) * 1000;
        console.log(
          `Retrying request after ${backoffTime}ms (attempt ${
            currentRetry + 1
          }/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return axios(error.config);
      } else {
        // After max retries, switch to demo mode
        localStorage.setItem("token", "demo-token-for-bypassing-auth");
        console.log("Switched to demo token due to network error");

        const originalRequest = error.config;
        originalRequest.headers["Authorization"] =
          "Bearer demo-token-for-bypassing-auth";
        return axios(originalRequest);
      }
    } else {
      // Something else happened while setting up the request
      console.error("API error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
