
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a helper function to show toasts
function createToastHelper() {
  // Default implementation logs to console
  let showToastImpl = (title: string, description: string, variant?: "default" | "destructive") => {
    console.log(`Toast (${variant || 'default'}): ${title} - ${description}`);
  };

  // The function we'll expose
  const showToast = (title: string, description: string, variant?: "default" | "destructive") => {
    showToastImpl(title, description, variant);
  };

  // A setter to update the implementation
  const setToastImplementation = (impl: typeof showToastImpl) => {
    showToastImpl = impl;
  };

  return { showToast, setToastImplementation };
}

// Create a single instance of the toast helper
const toastHelper = createToastHelper();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Set the toast implementation once the component mounts
  useEffect(() => {
    toastHelper.setToastImplementation((title, description, variant) => {
      toast({
        title,
        description,
        variant,
      });
    });
  }, [toast]);

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toastHelper.showToast("Successfully signed in", "Welcome back!");
        } else if (event === 'SIGNED_OUT') {
          toastHelper.showToast("Signed out", "You have been signed out.");
        }
      }
    );

    // Then check for existing session
    const fetchSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    };
    
    fetchSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Removed toast dependency to avoid circular dependency

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      toastHelper.showToast("Error signing in", error.message, "destructive");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      toastHelper.showToast("Account created", "Please check your email to confirm your account.");
    } catch (error: any) {
      toastHelper.showToast("Error signing up", error.message, "destructive");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toastHelper.showToast("Error signing out", error.message, "destructive");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
