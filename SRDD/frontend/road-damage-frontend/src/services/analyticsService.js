import api from './api';

export const analyticsService = {
  getAnalytics: () => api.get('analytics/'),
  getSeverity: () => api.get('complaints/severity/'),
  getChart: () => api.get('analytics/'),
  getEscalated: () => api.get('complaints/escalated/'),
};
