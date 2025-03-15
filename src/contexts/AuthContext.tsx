import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { uploadProfilePicture } from '../utils/api';

interface User {
  id: string;
  email: string;
  username: string;
  region: string;
  profilePictureUrl?: string;
  themePreference?: 'light' | 'dark';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, region: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePicture: (file: File) => Promise<{ profilePictureUrl: string }>;
  updateThemePreference: (theme: 'light' | 'dark') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000/api';

// Helper function to get user-specific profile picture
const getUserProfilePicture = (userId: string): string | null => {
  return localStorage.getItem(`profile_picture_${userId}`);
};

// Helper function to get user theme preference
const getUserThemePreference = (userId: string): 'light' | 'dark' | null => {
  const themePreference = localStorage.getItem(`theme_preference_${userId}`);
  return themePreference === 'light' || themePreference === 'dark' ? themePreference : null;
};

// Helper function to save user theme preference
const saveUserThemePreference = (userId: string, theme: 'light' | 'dark'): void => {
  localStorage.setItem(`theme_preference_${userId}`, theme);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load profile picture and theme preference from localStorage when user changes
  useEffect(() => {
    if (user?.id) {
      const savedProfilePicture = getUserProfilePicture(user.id);
      const savedThemePreference = getUserThemePreference(user.id);
      
      if (
        (savedProfilePicture && user.profilePictureUrl !== savedProfilePicture) ||
        (savedThemePreference && user.themePreference !== savedThemePreference)
      ) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            profilePictureUrl: savedProfilePicture || prevUser.profilePictureUrl,
            themePreference: savedThemePreference || prevUser.themePreference
          };
        });
      }
    }
  }, [user?.id]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include', // Important for sending cookies
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Check if we have a profile picture in localStorage for this user
        const savedProfilePicture = userData.id ? getUserProfilePicture(userData.id) : null;
        const savedThemePreference = userData.id ? getUserThemePreference(userData.id) : null;
        
        setUser({
          ...userData,
          profilePictureUrl: savedProfilePicture || userData.profilePictureUrl,
          themePreference: savedThemePreference || userData.themePreference
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important for receiving cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Check for saved profile picture and theme preference
      const savedProfilePicture = data.user.id ? getUserProfilePicture(data.user.id) : null;
      const savedThemePreference = data.user.id ? getUserThemePreference(data.user.id) : null;
      
      setUser({
        ...data.user,
        profilePictureUrl: savedProfilePicture || data.user.profilePictureUrl,
        themePreference: savedThemePreference || data.user.themePreference
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string, region: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          username,
          password,
          region
        }),
        credentials: 'include', // Important for receiving cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // After registration, the cookie will be set automatically
      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Important for sending cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Do not clear profile picture on logout
      // This is just for convenience in this demo
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfilePicture = async (file: File) => {
    try {
      if (!user) throw new Error('Not authenticated');
      
      const response = await uploadProfilePicture(file, user.id);
      
      // Update user object with the new profile picture URL
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profilePictureUrl: response.profilePictureUrl
        };
      });
      
      return response;
    } catch (error) {
      console.error('Profile picture update error:', error);
      throw error;
    }
  };

  // Add new function to update theme preference
  const updateThemePreference = (theme: 'light' | 'dark') => {
    if (!user) return;
    
    // Update user object with the new theme preference
    setUser(prevUser => {
      if (!prevUser) return null;
      
      // Save theme preference to localStorage
      saveUserThemePreference(prevUser.id, theme);
      
      return {
        ...prevUser,
        themePreference: theme
      };
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      register, 
      logout,
      updateProfilePicture,
      updateThemePreference
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 