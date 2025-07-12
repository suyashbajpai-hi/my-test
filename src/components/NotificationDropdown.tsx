import React, { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { MessageSquare, CheckCircle, AtSign, Bell, Sparkles } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { notifications, markNotificationRead } = useData();
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
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
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
      className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Bell className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {userNotifications.filter(n => !n.isRead).length > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {userNotifications.filter(n => !n.isRead).length} new
            </span>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {userNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 via-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          userNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-gray-100/50 hover:bg-gray-50/80 cursor-pointer transition-all duration-300 ${
                !notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1 p-2 bg-white rounded-xl shadow-sm border border-gray-200/50">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 bg-gray-100/80 px-2 py-1 rounded-full inline-block">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {userNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;