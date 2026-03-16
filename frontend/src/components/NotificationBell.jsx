import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching notifications...');
      const response = await api.get('/notifications');
      console.log('🔔 Raw notifications from API:', response.data);
      
      const allNotifications = response.data;
      
      // Simplified: Show all notifications, don't filter by bug status
      // Just show unread ones with higher priority
      const sortedNotifications = allNotifications.sort((a, b) => {
        // Unread first
        if (a.read !== b.read) return a.read ? 1 : -1;
        // Then by date
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      console.log('🔔 Sorted notifications:', sortedNotifications);
      const unreadCount = sortedNotifications.filter(n => !n.read).length;
      console.log('🔔 Unread count:', unreadCount);
      
      setNotifications(sortedNotifications);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      console.error('❌ Error response:', error.response?.data);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await api.put(`/notifications/${notification.id}/read`);
      
      // Navigate based on notification type
      switch (notification.type) {
        case 'bug_status_update':
          if (user.role === 'admin') {
            navigate('/admin/bug-reports');
          } else {
            navigate(`/${user.role}/bug-reports`);
          }
          break;
        case 'booking_confirmed':
          navigate('/mentee/bookings');
          break;
        case 'new_booking':
          navigate('/mentor/bookings');
          break;
        case 'feedback_received':
          navigate('/mentee/feedbacks');
          break;
        default:
          navigate(`/${user.role}/dashboard`);
      }
      
      setShowDropdown(false);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-[#171717] border border-[#404040] rounded-lg shadow-xl z-20 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#404040] flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-[#06b6d4] hover:text-[#0891b2] transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-[#404040] cursor-pointer hover:bg-[#262626] transition-colors ${
                        !notification.read ? 'bg-[#06b6d4]/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          !notification.read ? 'bg-[#06b6d4]' : 'bg-gray-600'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-1">
                            {notification.title}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {notification.message}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(notification.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
