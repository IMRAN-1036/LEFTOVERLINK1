import axios from "axios";

const apiRoot =
  ((import.meta as any)?.env?.VITE_API_URL as string) ||
  "http://localhost:5001";

const instance = axios.create({
  baseURL: `${apiRoot.replace(/\/$/, "")}/api`,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // Safe-guard headers object
    if (!config.headers) config.headers = {} as any;

    console.log(
      "Axios interceptor - Token from localStorage:",
      token ? `✓ Found (${token.substring(0, 20)}...)` : "✗ Not found",
    );

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
      console.log("Axios interceptor - Authorization header set");
    } else {
      console.warn(
        "Axios interceptor - No token available, request will be unauthorized",
      );
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Pass-through response interceptor so callers can check error.response.status
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    // Keep default behavior but surface for debugging
    console.error(
      "Axios response error:",
      error?.response?.status,
      error?.message,
    );
    return Promise.reject(error);
  },
);

export default instance;
