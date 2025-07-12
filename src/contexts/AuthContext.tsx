import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getBadgeForAnswerCount } from '../utils/badges';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserStats: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const badge = getBadgeForAnswerCount(data.questions_answered);
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          avatar: data.avatar_url,
          role: data.role,
          reputation: data.reputation,
          badge: badge.name,
          questionsAnswered: data.questions_answered,
          joinedAt: new Date(data.created_at)
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const updateUserStats = async (userId: string) => {
    try {
      // Count user's answers
      const { count } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      const questionsAnswered = count || 0;
      const badge = getBadgeForAnswerCount(questionsAnswered);

      // Update user stats
      const { error } = await supabase
        .from('users')
        .update({
          questions_answered: questionsAnswered,
          badge: badge.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local user state
      if (user && user.id === userId) {
        setUser(prev => prev ? {
          ...prev,
          questionsAnswered,
          badge: badge.name
        } : null);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username,
            email,
            role: 'user',
            reputation: 0,
            badge: 'Newcomer',
            questions_answered: 0
          });

        if (profileError) throw profileError;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    updateUserStats
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};