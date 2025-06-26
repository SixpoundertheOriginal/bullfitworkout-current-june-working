
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  full_name: string | null;
  age: number | null;
  weight: number | null;
  weight_unit: string;
  height: number | null;
  height_unit: string;
  fitness_goal: string | null;
  experience_level: string | null;
  training_experience: any;
  training_preferences: any;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('[useUserProfile] Hook initialized with user:', !!user);

  const fetchProfile = async () => {
    if (!user) {
      console.log('[useUserProfile] No user, skipping profile fetch');
      setProfile(null);
      setLoading(false);
      return;
    }

    console.log('[useUserProfile] Fetching profile for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[useUserProfile] Error fetching profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('[useUserProfile] Profile not found, creating new profile');
          await createProfile();
          return;
        }
        
        throw error;
      }

      console.log('[useUserProfile] Profile fetched successfully:', data);
      setProfile(data);
    } catch (err: any) {
      console.error('[useUserProfile] Profile fetch error:', err);
      setError(err.message);
      toast({
        title: "Error loading profile",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) {
      console.log('[useUserProfile] No user for profile creation');
      return;
    }

    console.log('[useUserProfile] Creating new profile for user:', user.id);

    try {
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

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error('[useUserProfile] Error creating profile:', error);
        throw error;
      }

      console.log('[useUserProfile] Profile created successfully:', data);
      setProfile(data);
      toast({
        title: "Profile created",
        description: "Your profile has been set up successfully!"
      });
    } catch (err: any) {
      console.error('[useUserProfile] Profile creation error:', err);
      setError(err.message);
      toast({
        title: "Error creating profile",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      console.log('[useUserProfile] No user or profile for update');
      return;
    }

    console.log('[useUserProfile] Updating profile with:', updates);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[useUserProfile] Error updating profile:', error);
        throw error;
      }

      console.log('[useUserProfile] Profile updated successfully:', data);
      setProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!"
      });

      return data;
    } catch (err: any) {
      console.error('[useUserProfile] Profile update error:', err);
      setError(err.message);
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    createProfile
  };
};
