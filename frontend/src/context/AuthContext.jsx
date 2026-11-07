import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('vt_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vt_token') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('vt_token', token);
    } else {
      localStorage.removeItem('vt_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('vt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vt_user');
    }
  }, [user]);

  const login = async (payload) => {
    const response = await api.post('/auth/login', payload);
    const loggedInUser = {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      profilePictureUrl: response.data.profilePictureUrl || '',
    };
    setUser(loggedInUser);
    setToken(response.data.token);
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    const registeredUser = {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      profilePictureUrl: response.data.profilePictureUrl || '',
    };
    setUser(registeredUser);
    setToken(response.data.token);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken('');
  };

  const updateProfilePicture = (profilePictureUrl) => {
    setUser((currentUser) => currentUser ? { ...currentUser, profilePictureUrl } : currentUser);
  };

  const value = useMemo(() => ({
    user,
    token,
    login,
    register,
    logout,
    updateProfilePicture,
    isAuthenticated: Boolean(token && user)
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
