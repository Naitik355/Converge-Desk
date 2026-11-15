import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser,
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
} from '../api/auth';
import { setStoredCsrfToken } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      if (userData && typeof userData === 'object' && userData.username && typeof userData.username === 'string') {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(payload);
      await refreshUser();
      success(res.message || 'Welcome back!', `Logged in as ${payload.username}`);
    } catch (err) {
      setIsLoading(false);
      const msg = err?.message || 'Login failed. Please check your credentials.';
      error('Authentication Error', msg);
      throw err;
    }
  };

  const signup = async (payload) => {
    setIsLoading(true);
    try {
      const res = await apiSignup(payload);
      // Automatically log in after signup
      await apiLogin({ username: payload.username, password: payload.password });
      await refreshUser();
      success(res.messages || 'Account created successfully!', `Welcome to ConvergeDesk, ${payload.username}`);
    } catch (err) {
      setIsLoading(false);
      const msg = err?.message || 'Failed to create account.';
      error('Sign Up Error', msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
      setStoredCsrfToken(null);
      success('Logged out successfully');
    } catch {
      // Even if network failed, clear local state
      setUser(null);
      setStoredCsrfToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user && user.username),
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
