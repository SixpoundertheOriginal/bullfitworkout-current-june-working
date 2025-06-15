import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, HardDrive, Zap, Settings, Code } from 'lucide-react';
import { useMemoryPressure } from '@/hooks/useMemoryPressure';
import { cleanupManager } from '@/services/cleanupManager';
import { exerciseCardPool } from '@/services/exerciseCardPool';
import { concurrencyManager } from '@/services/concurrencyManager';
import { performanceMonitor } from '@/services/performanceMonitor';

export default function DeveloperPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [stats, setStats] = useState({
    cleanup: cleanupManager.getStats(),
    pool: exerciseCardPool.getPoolStats(),
    concurrency: concurrencyManager.getStats()
  });
  const { memoryPressure, isHighMemoryUsage } = useMemoryPressure();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cleanup: cleanupManager.getStats(),
        pool: exerciseCardPool.getPoolStats(),
        concurrency: concurrencyManager.getStats()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const report = performanceMonitor.generateReport();
    setMetrics(report);
  }, []);

  const handleForceCleanup = () => {
    cleanupManager.cleanupAll();
    exerciseCardPool.cleanup();
    concurrencyManager.cancelByTag('background-sync');
    concurrencyManager.cancelByTag('prefetch');
  };

  const handleForceGC = () => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    } else {
      console.log('Manual GC not available');
    }
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
  };

  const getPerformanceRating = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return { rating: 'good', color: 'text-green-400' };
    if (value <= thresholds[1]) return { rating: 'needs-improvement', color: 'text-yellow-400' };
    return { rating: 'poor', color: 'text-red-400' };
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Code className="h-6 w-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Developer Tools</h1>
        <Badge variant="outline" className="text-purple-400 border-purple-400">
          Development Only
        </Badge>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="concurrency" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Concurrency
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Controls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Core Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics?.coreWebVitals.lcp && (
                <div className="flex justify-between">
                  <span className="text-gray-400">LCP (Largest Contentful Paint)</span>
                  <span className={getPerformanceRating(metrics.coreWebVitals.lcp, [2500, 4000]).color}>
                    {metrics.coreWebVitals.lcp.toFixed(0)}ms
                  </span>
                </div>
              )}
              {metrics?.coreWebVitals.fcp && (
                <div className="flex justify-between">
                  <span className="text-gray-400">FCP (First Contentful Paint)</span>
                  <span className={getPerformanceRating(metrics.coreWebVitals.fcp, [1800, 3000]).color}>
                    {metrics.coreWebVitals.fcp.toFixed(0)}ms
                  </span>
                </div>
              )}
              {metrics?.coreWebVitals.cls && (
                <div className="flex justify-between">
                  <span className="text-gray-400">CLS (Cumulative Layout Shift)</span>
                  <span className={getPerformanceRating(metrics.coreWebVitals.cls, [0.05, 0.1]).color}>
                    {metrics.coreWebVitals.cls.toFixed(3)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-blue-400" />
                Query Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Queries</span>
                <span className="text-green-400">{metrics?.queryMetrics.totalQueries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cache Hit Ratio</span>
                <span className="text-green-400">
                  {metrics ? (metrics.queryMetrics.cacheHitRatio * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Background Refreshes</span>
                <span className="text-purple-400">{metrics?.queryMetrics.backgroundRefreshCount || 0}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <HardDrive className="h-5 w-5 text-red-400" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-400">Memory Pressure:</span>
                <Badge 
                  variant={memoryPressure === 'high' ? 'destructive' : memoryPressure === 'medium' ? 'secondary' : 'default'}
                >
                  {memoryPressure}
                </Badge>
              </div>
              {isHighMemoryUsage && (
                <div className="text-red-400 text-sm">⚠ High memory usage detected</div>
              )}
              
              {metrics && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Used Heap</span>
                    <span className="text-orange-400">
                      {formatBytes(metrics.memoryMetrics.usedJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Heap</span>
                    <span className="text-blue-400">
                      {formatBytes(metrics.memoryMetrics.totalJSHeapSize)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Exercise Card Pool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cards</span>
                <span className="text-blue-400">{stats.pool.totalCards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">In Use</span>
                <span className="text-green-400">{stats.pool.inUse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available</span>
                <span className="text-gray-400">{stats.pool.available}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concurrency" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-purple-400" />
                Concurrency Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Running Tasks</span>
                <span className="text-green-400">{stats.concurrency.running}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Queued Tasks</span>
                <span className="text-yellow-400">{stats.concurrency.queued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed</span>
                <span className="text-blue-400">{stats.concurrency.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Failed</span>
                <span className="text-red-400">{stats.concurrency.failed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cancelled</span>
                <span className="text-gray-400">{stats.concurrency.cancelled}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5 text-green-400" />
                System Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleForceCleanup} 
                  variant="outline"
                  className="bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30"
                >
                  Force Cleanup
                </Button>
                <Button 
                  onClick={handleForceGC} 
                  variant="outline"
                  className="bg-orange-600/20 border-orange-500 text-orange-400 hover:bg-orange-600/30"
                >
                  Force GC
                </Button>
                <Button 
                  onClick={() => concurrencyManager.pause()} 
                  variant="outline"
                  className="bg-yellow-600/20 border-yellow-500 text-yellow-400 hover:bg-yellow-600/30"
                >
                  Pause Tasks
                </Button>
                <Button 
                  onClick={() => concurrencyManager.resume()} 
                  variant="outline"
                  className="bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/30"
                >
                  Resume Tasks
                </Button>
              </div>
              
              <Button 
                onClick={() => setMetrics(performanceMonitor.generateReport())}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Refresh All Metrics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Cleanup Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Scopes</span>
                <span className="text-green-400">{stats.cleanup.activeScopes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Global Cleanups</span>
                <span className="text-blue-400">{stats.cleanup.globalCleanups}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
