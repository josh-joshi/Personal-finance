import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Attach JWT token from localStorage on every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // we will store token here after login

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
