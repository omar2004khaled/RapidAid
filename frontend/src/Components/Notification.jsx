import React, { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, ShieldAlert } from "lucide-react";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/notificationAPI";
import websocketService from "../services/websocketService";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const notifs = await fetchNotifications();
      if (Array.isArray(notifs)) {
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.read && n.status !== 'READ').length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.warn("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    loadNotifications();

    let subId = null;
    websocketService.connect('ws://localhost:8080/ws', () => {
      subId = websocketService.subscribe("/topic/notification/unread", (data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.read && n.status !== 'READ').length);
        } else {
          loadNotifications();
        }
      });
    });

    return () => {
      if (subId) {
        websocketService.unsubscribe(subId);
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

  const handleNotificationClick = async (notif) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user?.sub || user?.email || '';
      const notifId = notif.notificationId || notif.id;
      await markNotificationAsRead(notifId, userEmail);
      setNotifications(prev => prev.map(n => (n.notificationId === notifId || n.id === notifId) ? { ...n, read: true, status: 'READ' } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user?.sub || user?.email || '';
      await markAllNotificationsAsRead(userEmail);
      setNotifications(prev => prev.map(n => ({ ...n, read: true, status: 'READ' })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-[#5B6859] hover:text-[#283227] hover:bg-[#F8EDE3] border border-transparent hover:border-[#BDD2B6] transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1 bg-[#798777] text-white text-xs font-bold rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#BDD2B6] z-50 overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-[#BDD2B6] flex items-center justify-between bg-[#F8EDE3]/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#283227] text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-[#BDD2B6]/40 text-[#283227] border border-[#A2B29F] font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#798777] hover:text-[#283227] hover:underline flex items-center gap-1 font-semibold"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#BDD2B6]/40">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-[#798777] text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.read && notif.status !== 'READ';
                return (
                  <div
                    key={notif.notificationId || notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isUnread
                        ? 'bg-[#F8EDE3]/50 hover:bg-[#F8EDE3]'
                        : 'hover:bg-[#FAF5EF] opacity-75'
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${isUnread ? 'bg-[#BDD2B6]/50 text-[#798777] border border-[#BDD2B6]' : 'bg-[#F8EDE3] text-[#5B6859]'}`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#283227] capitalize">
                          {notif.type ? notif.type.replace(/_/g, ' ').toLowerCase() : 'Emergency Alert'}
                        </span>
                        {isUnread && <span className="w-2 h-2 rounded-full bg-[#798777] flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-[#5B6859] line-clamp-2">
                        {notif.message || `Service: ${notif.serviceType || 'Emergency'} | Status: ${notif.status || 'Active'}`}
                      </div>
                      <div className="text-[10px] text-[#798777] mt-1 font-mono">
                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;