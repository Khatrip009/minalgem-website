  // src/api/client
  import axios from 'axios';

  const API_URL = import.meta.env.VITE_API_URL || '"https://apiminalgems.exotech.co.in/api"';

  const apiClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });

  let accessToken = null;

  export function setAccessToken(token) { accessToken = token; }
  export function getAccessToken() { return accessToken; }
  export function clearAccessToken() { accessToken = null; }

  apiClient.interceptors.request.use((config) => {
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  let isRefreshing = false;
  let failedQueue = [];
  const processQueue = (error, token) => {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
    failedQueue = [];
  };

  apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;
      
      // Only handle 401 if we actually had a token (user was logged in)
      if (error.response?.status === 401 && !originalRequest._retry && accessToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          if (data.ok && data.token) {
            setAccessToken(data.token);
            processQueue(null, data.token);
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return apiClient(originalRequest);
          }
          // Refresh failed – force logout
          clearAccessToken();
          processQueue(new Error('Session expired'));
          window.location.href = '/login';
        } catch (refreshError) {
          clearAccessToken();
          processQueue(refreshError);
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
        }
      }

      // No token → just reject normally (public page or initial load)
      return Promise.reject(error);
    }
  );

  export default apiClient;