
const API_URL = 'http://localhost:8080/api/notification';

export const fetchNotifications = async () => {
    try {
        const response = await fetch(`${API_URL}/all-unread`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return await response.json();
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const markNotificationAsRead = async (notificationId, userEmail) => {
    try {
        const response = await fetch(`${API_URL}/mark-read?id=${notificationId}&userEmail=${userEmail}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return await response.json();
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return null;
    }
};

export const markAllNotificationsAsRead = async (userEmail) => {
    try {
        const response = await fetch(`${API_URL}/mark-all-read?userEmail=${userEmail}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }
        });
        if (!response.ok) throw new Error('Failed to mark all notifications as read');
        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
    }
};