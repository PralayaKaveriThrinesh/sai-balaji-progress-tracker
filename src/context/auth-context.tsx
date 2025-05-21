
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, User } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

// Define auth context types
interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  loading: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Generate a mock OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Get available roles
  const getAvailableRoles = (): UserRole[] => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const takenRoles = ['admin', 'owner', 'checker'].filter(role => 
      users.some((u: User) => u.role === role)
    );
    
    const allRoles: UserRole[] = ['admin', 'owner', 'checker', 'leader'];
    return allRoles.filter(role => !takenRoles.includes(role) || role === 'leader');
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      setLoading(true);
      // Simulating a delay for API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if email already exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some((u: User) => u.email === email)) {
        toast.error('Email already exists. Please use a different email.');
        return false;
      }
      
      // Check if role is available
      const availableRoles = getAvailableRoles();
      if (role !== 'leader' && !availableRoles.includes(role)) {
        toast.error(`${role} role is already taken.`);
        return false;
      }
      
      // Create user
      const newUser: User = {
        id: `user_${Date.now().toString(36)}`,
        name,
        email,
        role,
        password // In a real app, this should be hashed
      };
      
      // Store user
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      toast.success('Account created successfully. You can now login.');
      return true;
    } catch (error) {
      console.error('Register error:', error);
      toast.error('An error occurred during registration.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulating a delay for API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: User) => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Set user data
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      
      toast.success('Login successful');
      
      // Navigate based on role
      if (foundUser.role === 'leader') navigate('/leader');
      else if (foundUser.role === 'checker') navigate('/checker');
      else if (foundUser.role === 'admin') navigate('/admin');
      else if (foundUser.role === 'owner') navigate('/owner');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      // Simulating a delay for API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    } finally {
      setLoading(false);
    }
  };

  // Request OTP function
  const requestOtp = async (email: string): Promise<boolean> => {
    try {
      // Check if user exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.email === email);
      
      if (!user) {
        toast.error('No account found with this email');
        return false;
      }
      
      // Generate and store OTP
      const otp = generateOtp();
      const otpData = {
        email,
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      };
      
      localStorage.setItem('otpData', JSON.stringify(otpData));
      
      // In a real app, this would send an email
      console.log(`OTP for ${email}: ${otp}`);
      toast.success(`OTP sent to ${email}. In a real app, this would be sent via email.`);
      
      return true;
    } catch (error) {
      console.error('Request OTP error:', error);
      toast.error('Failed to send OTP');
      return false;
    }
  };

  // Verify OTP function
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const otpDataString = localStorage.getItem('otpData');
      
      if (!otpDataString) {
        toast.error('No OTP request found');
        return false;
      }
      
      const otpData = JSON.parse(otpDataString);
      
      // Check if OTP matches and is not expired
      if (otpData.email !== email || otpData.otp !== otp || Date.now() > otpData.expiresAt) {
        toast.error('Invalid or expired OTP');
        return false;
      }
      
      // OTP verified
      localStorage.removeItem('otpData'); // Prevent reuse
      return true;
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP');
      return false;
    }
  };

  // Reset password function
  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.email === email);
      
      if (userIndex === -1) {
        toast.error('User not found');
        return false;
      }
      
      // Update password
      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      
      toast.success('Password reset successful');
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password');
      return false;
    }
  };

  // Provide auth context values
  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    logout,
    register,
    requestOtp,
    verifyOtp,
    resetPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
