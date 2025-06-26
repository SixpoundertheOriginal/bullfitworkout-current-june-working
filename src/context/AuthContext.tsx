
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthChangeEvent } from '@supabase/supabase-js';
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
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id 
      });
      
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle profile creation on sign up - using AuthChangeEvent enum
      if (event === AuthChangeEvent.SIGNED_UP && session?.user) {
        console.log('[AuthContext] New user signed up, ensuring profile exists');
        setTimeout(() => {
          ensureUserProfile(session.user);
        }, 0);
      }

      // Handle profile check on sign in - using AuthChangeEvent enum
      if (event === AuthChangeEvent.SIGNED_IN && session?.user) {
        console.log('[AuthContext] User signed in, checking profile');
        setTimeout(() => {
          ensureUserProfile(session.user);
        }, 0);
      }
    });

    // THEN check for existing session
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

    return () => {
      console.log('[AuthContext] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      console.log('[AuthContext] Checking if profile exists for user:', user.id);
      
      const { data: existingProfile, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('[AuthContext] Error checking profile:', error);
        return;
      }

      if (!existingProfile) {
        console.log('[AuthContext] Profile does not exist, creating...');
        
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          age: null,
          weight: null,
          weight_unit: 'kg',
          height: null,
          height_unit: 'cm',
          fitness_goal: null,
          experience_level: null,
          training_experience: {
            totalXp: 0,
            trainingTypeLevels: {
              Strength: { xp: 0 },
              Cardio: { xp: 0 },
              Yoga: { xp: 0 },
              Calisthenics: { xp: 0 }
            }
          },
          training_preferences: {
            preferred_time: null,
            preferred_types: [],
            preferred_duration: null
          }
        };

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('[AuthContext] Error creating profile:', insertError);
        } else {
          console.log('[AuthContext] Profile created successfully');
        }
      } else {
        console.log('[AuthContext] Profile already exists');
      }
    } catch (error) {
      console.error('[AuthContext] Error in ensureUserProfile:', error);
    }
  };

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
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('[AuthContext] Attempting sign up for:', email);
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
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
    } catch (error) {
      setLoading(false);
      throw error;
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
