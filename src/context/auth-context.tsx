
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { getCurrentUser, setCurrentUser, logoutUser } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  role: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadedUser = getCurrentUser();
    if (loadedUser) {
      setUser(loadedUser);
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
    setCurrentUser(user);
    
    // Redirect based on user role
    let redirectPath = '/';
    switch(user.role) {
      case 'leader':
        redirectPath = '/leader';
        break;
      case 'checker':
        redirectPath = '/checker';
        break;
      case 'owner':
        redirectPath = '/owner';
        break;
      case 'admin':
        redirectPath = '/admin';
        break;
    }
    
    toast.success(`Welcome, ${user.name}`, {
      description: `You are logged in as ${user.role}`,
    });
    
    navigate(redirectPath);
  };

  const logout = () => {
    setUser(null);
    logoutUser();
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    role: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
