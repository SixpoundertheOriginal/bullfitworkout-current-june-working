
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useWorkoutStatsContext } from '@/context/WorkoutStatsProvider';
import { StatsSection } from '@/components/profile/StatsSection';
import { ProfileLoadingSkeleton } from '@/components/profile/ProfileLoadingSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RecentWorkoutsSection } from '@/components/profile/RecentWorkoutsSection';
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
  const { stats, loading: statsLoading, error } = useWorkoutStatsContext();

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

  // Show loading for auth or stats
  if (authLoading || statsLoading) {
    return <ProfileLoadingSkeleton />;
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 text-center bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-red-400">Profile Error</h1>
        <p className="text-gray-400 mt-2">
          We couldn't load your profile stats. Please try refreshing the page.
        </p>
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Show content if user exists
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 text-center bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-400">No User Found</h1>
        <p className="text-gray-500 mt-2">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 bg-gray-900 min-h-screen text-white">
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-4 text-center">
        <Avatar className="h-24 w-24 border-4 border-purple-500">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || user?.email} />
          <AvatarFallback className="bg-purple-800 text-3xl text-white">
            {getInitials(user?.user_metadata?.full_name, user?.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-white">{user?.user_metadata?.full_name || 'Anonymous User'}</h1>
          <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>
      
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
