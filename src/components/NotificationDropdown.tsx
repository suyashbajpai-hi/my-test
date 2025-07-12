import React, { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { MessageSquare, CheckCircle, AtSign, Bell, Sparkles } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const { isDark } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userNotifications = user 
    ? notifications.filter(n => n.userId === user.id).slice(0, 10)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return <MessageSquare className="h-4 w-4 text-[color:var(--accent-primary)]" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-[color:var(--accent-secondary)]" />;
      default:
        return <MessageSquare className="h-4 w-4 text-[color:var(--text-tertiary)]" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markNotificationRead(notification.id);
    }
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 w-80 sm:w-96 glass-effect rounded-3xl shadow-2xl z-50 overflow-hidden border border-[color:var(--border-color)]"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="p-6 border-b border-[color:var(--border-color)]" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-xl flex items-center justify-center shadow-lg">
            <Bell className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
          {userNotifications.filter(n => !n.isRead).length > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {userNotifications.filter(n => !n.isRead).length} new
            </span>
          )}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
        {userNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[var(--accent-primary)]/20 via-[var(--accent-secondary)]/20 to-[var(--accent-tertiary)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-[color:var(--text-tertiary)]" />
            </div>
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No notifications yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>We'll notify you when something happens</p>
          </div>
        ) : (
          userNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-[color:var(--border-color)] hover:bg-[color:var(--bg-tertiary)] cursor-pointer transition-all duration-300 ${
                !notification.isRead ? 'bg-[color:var(--bg-tertiary)] border-l-4 border-l-[color:var(--accent-primary)]' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1 p-2 glass-effect rounded-xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {notification.message}
                  </p>
                  <p className="text-xs mt-2 glass-effect px-2 py-1 rounded-full inline-block" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {userNotifications.length > 0 && (
        <div className="p-4 border-t border-[color:var(--border-color)] text-center" style={{ background: 'var(--bg-secondary)' }}>
          <button className="text-sm font-semibold transition-colors" style={{ color: 'var(--accent-primary)' }}>
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;