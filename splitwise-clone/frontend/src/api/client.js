import axios from 'axios';

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

const client = axios.create({
  baseURL,
  withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}/auth/refresh/`, {}, { withCredentials: true });
        const newToken = res.data.access;
        setAccessToken(newToken);
        
        window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: newToken }));
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('authFailed'));
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
