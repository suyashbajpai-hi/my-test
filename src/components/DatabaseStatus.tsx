import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'setup-needed'>('checking');
  const [error, setError] = useState<string>('');

  const checkDatabaseConnection = async () => {
    try {
      setStatus('checking');
      setError('');

      // Test basic connection
      const { data, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (connectionError) {
        if (connectionError.message.includes('relation "users" does not exist')) {
          setStatus('setup-needed');
          setError('Database tables not created. Please set up Supabase.');
        } else {
          setStatus('error');
          setError(connectionError.message);
        }
      } else {
        setStatus('connected');
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Unknown error occurred');
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  if (status === 'connected') {
    return null; // Don't show anything when everything is working
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="glass-effect rounded-2xl p-4 shadow-2xl border border-yellow-500/30">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {status === 'checking' && (
              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            {status === 'setup-needed' && (
              <Database className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {status === 'checking' && 'Checking Database...'}
              {status === 'error' && 'Database Error'}
              {status === 'setup-needed' && 'Database Setup Required'}
            </h4>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {status === 'checking' && 'Connecting to database...'}
              {status === 'error' && error}
              {status === 'setup-needed' && 'Click "Connect to Supabase" to set up the database.'}
            </p>
            {status !== 'checking' && (
              <button
                onClick={checkDatabaseConnection}
                className="text-xs mt-2 px-3 py-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;