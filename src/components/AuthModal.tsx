import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b" style={{ 
          background: 'linear-gradient(to right, var(--accent-primary)/10, var(--accent-secondary)/10, var(--accent-tertiary)/10)',
          borderColor: 'var(--border-color)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-2xl flex items-center justify-center shadow-lg glow-effect">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold gradient-text">
                {isLogin ? 'Welcome Back' : 'Join StackIt'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="transition-colors p-2 hover:bg-[color:var(--bg-tertiary)] rounded-xl"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account and join our community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full pl-12 pr-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 focus:border-[color:var(--accent-primary)]/50 focus:bg-[color:var(--bg-tertiary)] transition-all duration-300"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Choose a username"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 focus:border-[color:var(--accent-primary)]/50 focus:bg-[color:var(--bg-tertiary)] transition-all duration-300"
                style={{ color: 'var(--text-primary)' }}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 focus:border-[color:var(--accent-primary)]/50 focus:bg-[color:var(--bg-tertiary)] transition-all duration-300"
                style={{ color: 'var(--text-primary)' }}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] hover:from-[var(--accent-primary)]/90 hover:via-[var(--accent-secondary)]/90 hover:to-[var(--accent-tertiary)]/90 disabled:from-[var(--accent-primary)]/50 disabled:via-[var(--accent-secondary)]/50 disabled:to-[var(--accent-tertiary)]/50 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl glow-effect"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--accent-primary)' }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {isLogin && (
            <div className="text-xs glass-effect p-4 rounded-2xl border" style={{ 
              color: 'var(--text-tertiary)', 
              borderColor: 'var(--accent-primary)' 
            }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Demo credentials:</p>
              <div className="space-y-1">
                <p><span className="font-medium">Email:</span> john@example.com</p>
                <p><span className="font-medium">Password:</span> password</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;