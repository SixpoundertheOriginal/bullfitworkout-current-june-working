
// Development panel for monitoring workout data flow
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkoutRegressionTest } from '@/hooks/useWorkoutRegressionTest';
import { workoutLogger } from '@/services/workoutLogger';
import { AlertCircle, CheckCircle, Clock, Play, RotateCcw } from 'lucide-react';

export const WorkoutRegressionPanel: React.FC = () => {
  const { testResult, isRunning, runRegressionTest, resetTest } = useWorkoutRegressionTest();

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const getStatusColor = () => {
    if (!testResult) return 'gray';
    if (testResult.failed > 0) return 'red';
    return 'green';
  };

  const getStatusIcon = () => {
    if (isRunning) return <Clock className="h-4 w-4 animate-spin" />;
    if (!testResult) return null;
    if (testResult.failed > 0) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const recentErrors = workoutLogger.getLogsByLevel('error', 5);
  const recentWarnings = workoutLogger.getLogsByLevel('warn', 5);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 space-y-2">
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {getStatusIcon()}
            Workout Regression Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Test Controls */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={runRegressionTest}
              disabled={isRunning}
              className="flex-1"
            >
              <Play className="h-3 w-3 mr-1" />
              {isRunning ? 'Running...' : 'Run Test'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetTest}
              disabled={isRunning}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Passed: {testResult.passed}</span>
                <span>Failed: {testResult.failed}</span>
                <span>{Math.round(testResult.duration)}ms</span>
              </div>
              
              <Badge variant={getStatusColor() === 'green' ? 'default' : 'destructive'}>
                {testResult.failed === 0 ? 'All Tests Passed' : `${testResult.failed} Tests Failed`}
              </Badge>

              {testResult.errors.length > 0 && (
                <div className="max-h-20 overflow-y-auto">
                  {testResult.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-400 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-1">Recent Errors:</div>
              <div className="max-h-16 overflow-y-auto space-y-1">
                {recentErrors.map((log, index) => (
                  <div key={index} className="text-xs text-red-400">
                    {log.message.substring(0, 50)}...
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Warnings */}
          {recentWarnings.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-1">Recent Warnings:</div>
              <div className="max-h-16 overflow-y-auto space-y-1">
                {recentWarnings.map((log, index) => (
                  <div key={index} className="text-xs text-yellow-400">
                    {log.message.substring(0, 50)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
