import api from './api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

export const complaintService = {
  create: (formData) => api.post('complaints/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyList: () => api.get('my-complaints/'),
  getAll: () => api.get('complaints/list/'),
  getTrack: (id) => api.get(`complaints/${id}/`),
  updateStatus: (id, status, extraData = {}) => api.put(`complaints/${id}/status/`, { status, ...extraData }),
  uploadAfterImage: (id, formData) => api.put(`complaints/${id}/after-image/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getEscalated: () => api.get('complaints/escalated/'),
  submitFeedback: (id, rating, feedback_text) => api.put(`complaints/${id}/feedback/`, { rating, feedback_text }),
  downloadReport: async (id) => {
    const token = localStorage.getItem('access');
    const response = await axios.get(`${API_URL}complaints/${id}/report/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      responseType: 'blob'
    });
    return response.data;
  }
};
