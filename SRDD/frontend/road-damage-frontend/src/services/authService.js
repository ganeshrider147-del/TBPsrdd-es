import api from './api';

export const authService = {
  login: (username, password) => api.post('login/', { username, password }),
  register: (data) => api.post('register/', data),
};
