
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const ProfileLoadingSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 text-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
      
      {/* Stats Section Skeleton */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-4" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Settings section skeleton */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
            <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};
