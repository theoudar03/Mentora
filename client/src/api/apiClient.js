import axios from 'axios';

const apiClient = axios.create({
  // Use relative URL — Vite proxy forwards /api → localhost:5000/api
  // This keeps everything same-origin so HTTP-only cookies work correctly
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — redirect to login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
