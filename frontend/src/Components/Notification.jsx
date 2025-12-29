import { useEffect, useState, useRef } from "react";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/notificationAPI";
import { useNavigate } from "react-router-dom";
import websocketService from "../services/websocketService";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();


    // Initial load and WebSocket subscription for real-time updates
    useEffect(() => {
        let notificationSubscriptionId = null;
        const loadNotifications = async () => {
            const notifs = await fetchNotifications();
            setNotifications(notifs);
            setUnreadCount(notifs.length);
        };
        loadNotifications();

        // Connect and subscribe to notification updates
        websocketService.connect(undefined, () => {
            notificationSubscriptionId = websocketService.subscribe(
                "/topic/notification/unread",
                (data) => {
                    // data is expected to be the new list of notifications
                    setNotifications(data);
                    // Optionally update unread count if available
                    if (Array.isArray(data)) {
                        setUnreadCount(data.filter(n => !n.read && n.status !== 'READ').length);
                    }
                }
            );
        });

        return () => {
            if (notificationSubscriptionId) {
                websocketService.unsubscribe(notificationSubscriptionId);
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notificationId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const userEmail = user.sub;
        await markNotificationAsRead(notificationId, userEmail);
    };

    return (
        <div className="relative notification-container" ref={dropdownRef}>
            <button
                className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                onClick={handleBellClick}
                aria-label="Notifications"
            >
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
                    <ul className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <li className="p-4 text-gray-500 text-center">No notifications</li>
                        ) : (
                            notifications.map((notif) => (
                                <li
                                    key={notif.notificationId || notif.id}
                                    className={`px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-start ${notif.read ? 'opacity-60' : ''}`}
                                    onClick={() => handleNotificationClick(notif.notificationId || notif.id)}
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800 mb-1">
                                            {notif.type ? notif.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : 'Notification'}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1">
                                            <span className="font-semibold">Status:</span> {notif.status || 'N/A'}
                                        </div>
                                        {notif.serviceType && (
                                            <div className="text-sm text-gray-600 mb-1">
                                                <span className="font-semibold">Service:</span> {notif.serviceType}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mb-1">
                                            <span className="font-semibold">ID:</span> {notif.notificationId || notif.id}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {notif.timestamp ? new Date(notif.timestamp).toLocaleString() : ''}
                                        </div>
                                    </div>
                                    {!notif.read && notif.status !== 'READ' && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Notification;