import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

console.log('🚀 AUTH_CONTEXT: Initializing AuthContext');
console.log('🚀 AUTH_CONTEXT: Backend URL:', BACKEND_URL);
console.log('🚀 AUTH_CONTEXT: API URL:', API);

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('🚀 AUTH_PROVIDER: Starting AuthProvider');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  console.log('🚀 AUTH_PROVIDER: Initial state - token:', !!token, 'loading:', loading);

  useEffect(() => {
    console.log('🚀 AUTH_PROVIDER: useEffect triggered, token:', !!token);
    
    // Set a maximum loading time to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('🚨 AUTH_PROVIDER: Loading timeout - proceeding without authentication');
        setLoading(false);
      }
    }, 3000); // 3 second maximum loading time

    if (token) {
      console.log('🚀 AUTH_PROVIDER: Token found, fetching user');
      fetchUser().finally(() => {
        clearTimeout(loadingTimeout);
      });
    } else {
      console.log('🚀 AUTH_PROVIDER: No token, setting loading to false');
      setLoading(false);
      clearTimeout(loadingTimeout);
    }

    return () => clearTimeout(loadingTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUser = async () => {
    console.log('🚀 AUTH_PROVIDER: fetchUser called');
    console.log('🚀 AUTH_PROVIDER: Making request to:', `${API}/auth/me`);
    
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000 // 3 second timeout
      });
      console.log('🚀 AUTH_PROVIDER: User fetched successfully:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('🚨 AUTH_PROVIDER: Failed to fetch user:', error);
      console.error('🚨 AUTH_PROVIDER: Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Don't logout on network errors, only on auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🚨 AUTH_PROVIDER: Auth error, logging out');
        logout();
      } else {
        console.log('🚨 AUTH_PROVIDER: Network error, keeping user logged in');
      }
    } finally {
      console.log('🚀 AUTH_PROVIDER: fetchUser completed, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('🚀 AUTH_PROVIDER: login called for email:', email);
    
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password }, {
        timeout: 10000 // 10 second timeout for login
      });
      console.log('🚀 AUTH_PROVIDER: Login successful');
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('🚨 AUTH_PROVIDER: Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    console.log('🚀 AUTH_PROVIDER: register called');
    
    try {
      const response = await axios.post(`${API}/auth/register`, userData, {
        timeout: 10000 // 10 second timeout for registration
      });
      console.log('🚀 AUTH_PROVIDER: Registration successful');
      return response.data;
    } catch (error) {
      console.error('🚨 AUTH_PROVIDER: Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚀 AUTH_PROVIDER: logout called');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isMentor: user?.role === 'mentor',
    isMentee: user?.role === 'mentee'
  };

  console.log('🚀 AUTH_PROVIDER: Rendering with loading:', loading, 'user:', !!user);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
