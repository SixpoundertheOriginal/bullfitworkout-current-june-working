
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Initializing authentication...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AuthContext] Initial session check:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        error: error?.message 
      });
      
      if (error) {
        console.error('[AuthContext] Error getting initial session:', error);
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth state changed:', { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id 
      });
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Attempting sign in for:', email);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('[AuthContext] Sign in error:', error);
        throw error;
      }
      console.log('[AuthContext] Sign in successful');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('[AuthContext] Attempting sign up for:', email);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        console.error('[AuthContext] Sign up error:', error);
        throw error;
      }
      console.log('[AuthContext] Sign up successful');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] Attempting sign out');
    await supabase.auth.signOut();
    console.log('[AuthContext] Sign out completed');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  console.log('[AuthContext] Current state:', { 
    hasUser: !!user, 
    loading, 
    userId: user?.id 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
