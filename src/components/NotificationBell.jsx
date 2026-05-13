import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnread = async () => {
    try {
      const res = await apiClient.get('/crm/notifications/unread');
      if (res.data.ok) {
        const items = res.data.items || [];
        setUnreadCount(items.length);
        setNotifications(items.slice(0, 10)); // show latest 10
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiClient.post(`/crm/notifications/${id}/read`);
      fetchUnread();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.post('/crm/notifications/mark-all-read');
      fetchUnread();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-charcoal hover:text-gold-600 transition"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gold-200 shadow-lg rounded-sm z-50">
          <div className="p-3 border-b border-gold-100 flex justify-between items-center">
            <span className="font-serif text-gold-600">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-gold-500 hover:text-gold-700 uppercase tracking-wider"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-charcoal text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-3 border-b border-gold-50 hover:bg-gold-50 transition">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{n.title}</p>
                      <p className="text-xs text-gold-600 mt-1">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-gold-400 hover:text-gold-600"
                      aria-label="Mark as read"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 text-center border-t border-gold-100">
            <Link
              to="/notifications"
              className="text-xs text-gold-600 hover:text-gold-800 uppercase tracking-wider"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}