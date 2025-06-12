
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Target, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome to BullFit
        </h1>
        <p className="text-muted-foreground text-lg">
          Your fitness journey starts here
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => navigate('/training-session')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Start Workout</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Begin Training</div>
            <p className="text-xs text-muted-foreground">
              Start your workout session
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => navigate('/exercises')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercises</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Browse Library</div>
            <p className="text-xs text-muted-foreground">
              View exercise library
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => navigate('/overview')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">View Stats</div>
            <p className="text-xs text-muted-foreground">
              Track your progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          size="lg" 
          onClick={() => navigate('/training-session')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        >
          <Plus className="w-5 h-5 mr-2" />
          Start New Workout
        </Button>
      </div>
    </div>
  );
};
