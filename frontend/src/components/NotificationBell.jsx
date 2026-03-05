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
      const response = await api.get('/notifications');
      const allNotifications = response.data;
      
      // Filter notifications: show all unread, and for bug reports, only show if bug is not resolved
      const filteredNotifications = [];
      
      for (const notification of allNotifications) {
        if (notification.type === 'bug_status_update') {
          // For bug notifications, check if the bug is still unresolved
          // We'll show the notification if it's unread OR if the bug is not resolved yet
          if (!notification.read) {
            filteredNotifications.push(notification);
          } else {
            // Check if bug is resolved by fetching bug reports
            try {
              const bugReports = await api.get('/bug-reports/my');
              const relatedBug = bugReports.data.find(bug => 
                notification.message.includes(bug.title)
              );
              
              // Only show if bug is not resolved
              if (relatedBug && relatedBug.status !== 'resolved') {
                filteredNotifications.push(notification);
              }
            } catch (error) {
              // If we can't fetch bug reports, show the notification anyway
              filteredNotifications.push(notification);
            }
          }
        } else {
          // For non-bug notifications, show all
          filteredNotifications.push(notification);
        }
      }
      
      setNotifications(filteredNotifications);
      setUnreadCount(filteredNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await api.put(`/notifications/${notification.id}/read`);
      
      // Navigate based on notification type
      if (notification.type === 'bug_status_update') {
        if (user.role === 'admin') {
          navigate('/admin/bug-reports');
        } else {
          navigate(`/${user.role}/dashboard`);
        }
      }
      
      setShowDropdown(false);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
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
          <div className="absolute right-0 mt-2 w-80 bg-[#171717] border border-[#404040] rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-[#404040]">
              <h3 className="text-white font-semibold">Notifications</h3>
            </div>
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
        </>
      )}
    </div>
  );
};

export default NotificationBell;
