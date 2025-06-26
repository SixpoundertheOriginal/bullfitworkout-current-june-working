
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useWorkoutStatsContext } from '@/context/WorkoutStatsProvider';
import { StatsSection } from '@/components/profile/StatsSection';
import { ProfileLoadingSkeleton } from '@/components/profile/ProfileLoadingSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RecentWorkoutsSection } from '@/components/profile/RecentWorkoutsSection';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserProfileForm } from '@/components/UserProfileForm';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { z } from 'zod';

export const profileFormSchema = z.object({
  full_name: z.string().nullable().optional(),
  age: z.union([z.number().positive().int().nullable(), z.string().transform(v => v === "" ? null : parseInt(v))]),
  weight: z.union([z.number().positive().nullable(), z.string().transform(v => v === "" ? null : parseFloat(v))]),
  weight_unit: z.string().default("kg"),
  height: z.union([z.number().positive().nullable(), z.string().transform(v => v === "" ? null : parseFloat(v))]),
  height_unit: z.string().default("cm"),
  fitness_goal: z.string().nullable().optional(),
  experience_level: z.string().nullable().optional(),
});

export type UserProfileData = z.infer<typeof profileFormSchema>;

export const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useWorkoutStatsContext();
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  console.log('[ProfilePage] Rendering with state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    profileLoading,
    statsLoading,
    isEditing
  });

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || 'U';
  };

  const handleProfileUpdate = async (data: UserProfileData) => {
    console.log('[ProfilePage] Updating profile with data:', data);
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('[ProfilePage] Profile update failed:', error);
    }
  };

  const handleAvatarChange = (url: string | null) => {
    console.log('[ProfilePage] Avatar changed to:', url);
    // This would typically update the user's auth metadata
    // For now, we'll just log it
  };

  // Show loading for auth or profile
  if (authLoading || profileLoading) {
    console.log('[ProfilePage] Showing loading skeleton');
    return <ProfileLoadingSkeleton />;
  }
  
  // Show error state
  if (profileError || statsError) {
    console.log('[ProfilePage] Showing error state:', { profileError, statsError });
    return (
      <div className="container mx-auto px-4 py-6 text-center bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-red-400">Profile Error</h1>
        <p className="text-gray-400 mt-2">
          We couldn't load your profile data. Please try refreshing the page.
        </p>
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">
            {profileError || statsError?.message}
          </p>
        </div>
      </div>
    );
  }

  // Show content if user exists
  if (!user) {
    console.log('[ProfilePage] No user found');
    return (
      <div className="container mx-auto px-4 py-6 text-center bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-400">No User Found</h1>
        <p className="text-gray-500 mt-2">Please log in to view your profile.</p>
      </div>
    );
  }

  console.log('[ProfilePage] Rendering profile content');

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 bg-gray-900 min-h-screen text-white">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <Button
          variant={isEditing ? "destructive" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Header Card */}
      {profile && (
        <ProfileHeader
          fullName={profile.full_name}
          email={user.email}
          avatarUrl={user.user_metadata?.avatar_url}
          fitnessGoal={profile.fitness_goal}
          onAvatarChange={handleAvatarChange}
        />
      )}

      {/* Profile Form */}
      {isEditing && profile && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Edit Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <UserProfileForm
              initialData={{
                full_name: profile.full_name,
                age: profile.age,
                weight: profile.weight,
                weight_unit: profile.weight_unit,
                height: profile.height,
                height_unit: profile.height_unit,
                fitness_goal: profile.fitness_goal,
                experience_level: profile.experience_level,
              }}
              onSubmit={handleProfileUpdate}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Stats Section */}
      <ErrorBoundary>
        <StatsSection
          totalWorkouts={stats?.totalWorkouts || 0}
          totalSets={stats?.totalSets || 0}
          averageDuration={stats?.avgDuration || 0}
          totalDuration={stats?.totalDuration || 0}
        />
      </ErrorBoundary>

      {/* Recent Workouts Section */}
      <ErrorBoundary>
        <RecentWorkoutsSection workouts={stats?.workouts || []} />
      </ErrorBoundary>
      
      {/* Settings Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Manage your app preferences here. (Coming Soon)</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
