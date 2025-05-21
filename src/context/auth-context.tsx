
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '@/lib/types';
import { CustomDatabase } from '@/types/supabase-database-types';

// Define auth context types
interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Load user data from localStorage on initial render
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('users' as keyof CustomDatabase['public']['Tables'])
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user data:', error);
            setUser(null);
            setLoading(false);
            return;
          }

          const userWithRole: User = {
            id: session.user.id,
            name: data?.name,
            email: data?.email,
            role: data?.role as UserRole,
            password: '' // We don't want to expose the password
          };
          
          setUser(userWithRole);
        }
      } catch (error) {
        console.error('Session loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data, error } = await supabase
            .from('users' as keyof CustomDatabase['public']['Tables'])
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user data:', error);
            setUser(null);
            return;
          }

          const userWithRole: User = {
            id: session.user.id,
            name: data?.name,
            email: data?.email,
            role: data?.role as UserRole,
            password: '' // We don't want to expose the password
          };
          
          setUser(userWithRole);
        } else {
          setUser(null);
        }
      }
    );

    loadSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user role from users table
        const { data: userData, error: userError } = await supabase
          .from('users' as keyof CustomDatabase['public']['Tables'])
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError) throw userError;

        const role = userData?.role as UserRole;

        // Navigate based on role
        if (role === 'leader') navigate('/leader');
        else if (role === 'checker') navigate('/checker');
        else if (role === 'admin') navigate('/admin');
        else if (role === 'owner') navigate('/owner');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context values
  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    logout,
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
