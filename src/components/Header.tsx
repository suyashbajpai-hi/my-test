import React, { useState } from 'react';
import { Bell, User, LogOut, Search, Sparkles, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import AuthModal from './AuthModal';

interface HeaderProps {
  onAskQuestion: () => void;
  onHome: () => void;
  onProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAskQuestion, onHome, onProfile }) => {
  const { user, logout } = useAuth();
  const { getUnreadNotificationCount } = useData();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = getUnreadNotificationCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  return (
    <>
      <header className="glass-effect sticky top-0 z-50 shadow-lg glow-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={onHome}
                className="flex items-center space-x-2 text-xl lg:text-2xl font-bold gradient-text hover:scale-105 transition-all duration-300"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-xl flex items-center justify-center shadow-lg glow-effect">
                  <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <span className="hidden sm:block">StackIt</span>
              </button>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <input
                  type="text"
                  placeholder="Search questions, tags, or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 glass-effect rounded-2xl leading-5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 focus:border-[color:var(--accent-primary)]/50 focus:bg-[color:var(--bg-tertiary)] transition-all duration-300"
                  style={{ color: 'var(--text-primary)' }}
                />
              </form>
            </div>

            {/* Desktop Right side */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 hover:bg-[color:var(--bg-tertiary)] rounded-2xl transition-all duration-300 glass-effect"
                style={{ color: 'var(--text-secondary)' }}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {user ? (
                <>
                  {/* Ask Question Button */}
                  <button
                    onClick={onAskQuestion}
                    className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] hover:from-[var(--accent-primary)]/90 hover:via-[var(--accent-secondary)]/90 hover:to-[var(--accent-tertiary)]/90 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl glow-effect"
                  >
                    Ask Question
                  </button>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-3 hover:bg-[color:var(--bg-tertiary)] rounded-2xl transition-all duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <NotificationDropdown onClose={() => setShowNotifications(false)} />
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center space-x-3 glass-effect rounded-2xl px-4 py-2">
                    <button
                      onClick={onProfile}
                      className="flex items-center space-x-2 text-sm hover:bg-[color:var(--bg-tertiary)] rounded-xl px-2 py-1 transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.username}</span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user.reputation} rep</span>
                      </div>
                    </button>
                    <button
                      onClick={logout}
                      className="p-2 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] hover:from-[var(--accent-primary)]/90 hover:via-[var(--accent-secondary)]/90 hover:to-[var(--accent-tertiary)]/90 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl glow-effect"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-[color:var(--bg-tertiary)] rounded-xl transition-all duration-300"
                style={{ color: 'var(--text-secondary)' }}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-[color:var(--bg-tertiary)] rounded-xl transition-all duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>
              )}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-[color:var(--bg-tertiary)] rounded-xl transition-all duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t py-4 space-y-4 glass-effect" style={{ borderColor: 'var(--border-color)' }}>
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 glass-effect rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50"
                  style={{ color: 'var(--text-primary)' }}
                />
              </form>

              {user ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onAskQuestion();
                      setShowMobileMenu(false);
                    }}
                    className="w-full bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] text-white px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 glow-effect"
                  >
                    Ask Question
                  </button>
                  
                  <div className="flex items-center justify-between p-3 glass-effect rounded-2xl">
                    <button
                      onClick={() => {
                        onProfile();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center space-x-3 flex-1"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.username}</div>
                        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{user.reputation} reputation</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                      }}
                      className="p-2 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] text-white px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 glow-effect"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};

export default Header;