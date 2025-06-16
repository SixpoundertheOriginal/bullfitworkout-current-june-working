
import React from 'react';
import { Calendar, BarChart3, Zap } from 'lucide-react';
import { EnterpriseGrid, GridSection } from '@/components/layouts/EnterpriseGrid';
import { ResponsiveContainer } from '@/components/layouts/ResponsiveContainer';

export const OverviewWidgetsSection: React.FC = React.memo(() => {
  return (
    <EnterpriseGrid columns={4} gap="lg" minRowHeight="200px">
      <GridSection span={1} title="Training Consistency">
        <ResponsiveContainer 
          variant="card" 
          minHeight="200px"
          padding="md"
        >
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">Weekly pattern</span>
          </div>
          <div className="space-y-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                <span className="text-sm text-gray-400">{day}</span>
                <div className="w-16 h-2 bg-gray-700 rounded">
                  <div 
                    className="h-full bg-purple-400 rounded" 
                    style={{ width: `${Math.random() * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </GridSection>

      <GridSection span={1} title="Performance Score">
        <ResponsiveContainer 
          variant="card" 
          minHeight="200px"
          padding="md"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">8.5</div>
            <div className="text-sm text-gray-400 mb-4">Overall Score</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </ResponsiveContainer>
      </GridSection>

      <GridSection span={1} title="Weekly Summary">
        <ResponsiveContainer 
          variant="card" 
          minHeight="200px"
          padding="md"
        >
          <div className="space-y-3">
            <div className="p-3 bg-gray-800/30 rounded border-l-2 border-purple-400">
              <p className="text-sm text-gray-300">Strength trending upward</p>
              <p className="text-xs text-gray-500">Based on recent workouts</p>
            </div>
            <div className="p-3 bg-gray-800/30 rounded border-l-2 border-blue-400">
              <p className="text-sm text-gray-300">Consistent training schedule</p>
              <p className="text-xs text-gray-500">Great job this week!</p>
            </div>
          </div>
        </ResponsiveContainer>
      </GridSection>
    </EnterpriseGrid>
  );
});

OverviewWidgetsSection.displayName = 'OverviewWidgetsSection';
