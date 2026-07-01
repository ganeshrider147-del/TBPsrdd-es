import axios from 'axios';

let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL && typeof window !== 'undefined') {
  const origin = window.location.origin;

  if (origin.includes('tbpsrdd-es-production-b2fa.up.railway.app')) {
    API_URL = 'https://tbpsrdd-backend-93820.up.railway.app/api/';
  } else if (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    API_URL = 'http://localhost:8000/api/';
  } else {
    API_URL = 'https://tbpsrdd-backend-93820.up.railway.app/api/';
  }
}

if (!API_URL) {
  API_URL = 'https://tbpsrdd-backend-93820.up.railway.app/api/';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh');

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_URL}refresh/`,
            {
              refresh: refreshToken,
            }
          );

          localStorage.setItem(
            'access',
            response.data.access
          );

          api.defaults.headers.common.Authorization =
            `Bearer ${response.data.access}`;

          originalRequest.headers.Authorization =
            `Bearer ${response.data.access}`;

          return api(originalRequest);
        } catch (e) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export const getMediaUrl = (path) => {
  if (!path) return '';

  if (path.startsWith('http')) return path;

  return `${API_URL.replace('/api/', '')}${path}`;
};

export default api;
