import { API_BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';

const API_URL = `${API_BASE_URL}/api/notification`;

export const fetchNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/all-unread`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId, userEmail) => {
  try {
    const response = await fetch(`${API_URL}/mark-read?id=${encodeURIComponent(notificationId)}&userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

export const markAllNotificationsAsRead = async (userEmail) => {
  try {
    const response = await fetch(`${API_URL}/mark-all-read?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return response.ok;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

export default {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};