
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useWorkoutStatsContext } from '@/context/WorkoutStatsProvider';
import { StatsSection } from '@/components/profile/StatsSection';
import { ProfileLoadingSkeleton } from '@/components/profile/ProfileLoadingSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading, error } = useWorkoutStatsContext();

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

  if (loading) {
    return <ProfileLoadingSkeleton />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-3xl font-bold text-red-500">An Error Occurred</h1>
        <p className="text-muted-foreground mt-2">
          We couldn't load your profile stats. Please try again later.
        </p>
        <pre className="mt-4 text-xs text-left bg-gray-800 p-2 rounded">
          {error.message}
        </pre>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-4 text-center">
        <Avatar className="h-24 w-24 border-4 border-purple-500">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || user?.email} />
          <AvatarFallback className="bg-purple-800 text-3xl">
            {getInitials(user?.user_metadata?.full_name, user?.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user?.user_metadata?.full_name || 'Anonymous User'}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      
      {/* Stats Section */}
      <ErrorBoundary>
        <StatsSection
          totalWorkouts={stats.totalWorkouts}
          totalSets={stats.totalSets}
          averageDuration={stats.avgDuration}
          totalDuration={stats.totalDuration}
        />
      </ErrorBoundary>
      
      {/* Placeholder for future sections */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage your app preferences here. (Coming Soon)</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
