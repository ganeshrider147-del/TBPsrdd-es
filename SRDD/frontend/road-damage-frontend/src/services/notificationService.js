import api from './api';

export const notificationService = {
    getNotifications: () => api.get('notifications/'),

    getUnreadCount: async () => {
        try {
            const response = await api.get('notifications/unread-count/');
            return response.data.count || 0;
        } catch (e) {
            return 0;
        }
    },

    markAsRead: (id) => api.put(`notifications/${id}/read/`),

    markAllAsRead: () => api.put('notifications/mark-all-read/'),
};
