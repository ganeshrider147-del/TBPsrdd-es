import api from './api';

export const dashboardService = {
  getStats: () => api.get('dashboard/'),
  getChart: () => api.get('complaints/chart/'),
  getSeverity: () => api.get('complaints/severity/'),
};
