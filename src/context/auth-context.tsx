
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, UserRole } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  login: async () => {},
  logout: async () => {},
  register: async () => false,
  isAuthenticated: false,
  role: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event);
      setSession(newSession);
      
      if (newSession?.user) {
        // Defer user profile loading to avoid potential deadlocks
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          
          if (profile) {
            const userData: User = {
              id: newSession.user.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole
            };
            setUser(userData);
          }
        }, 0);
      } else {
        setUser(null);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      
      if (existingSession?.user) {
        // Defer user profile loading to avoid potential deadlocks
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();
          
          if (profile) {
            const userData: User = {
              id: existingSession.user.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole
            };
            setUser(userData);
          }
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data.user) {
        // User data is set via the onAuthStateChange event
        toast.success(`Welcome back!`);
        
        // Get user profile to determine redirect path
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profile) {
          // Redirect based on user role
          let redirectPath = '/';
          switch(profile.role) {
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
          
          navigate(redirectPath);
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again",
      });
    }
  };

  const logout = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Reset state
      setUser(null);
      setSession(null);
      
      toast.success("Logged out successfully");
      
      // Force page reload for a clean state
      window.location.href = '/login';
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast.error("Logout failed", {
        description: error.message || "Please try again",
      });
    }
  };
  
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Try to sign out if there's an existing session
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) {
        console.error("Registration error:", error);
        toast.error("Registration failed", {
          description: error.message,
        });
        return false;
      }
      
      toast.success("Registration successful!", {
        description: "You can now log in with your credentials.",
      });
      return true;
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error("Registration failed", {
        description: error.message || "Please try again",
      });
      return false;
    }
  };

  const value = {
    user,
    session,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    role: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
