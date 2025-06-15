import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemoryPressure } from '@/hooks/useMemoryPressure';
import { cleanupManager } from '@/services/cleanupManager';
import { exerciseCardPool } from '@/services/exerciseCardPool';
import { networkOptimization } from '@/services/networkOptimization';
import { concurrencyManager } from '@/services/concurrencyManager';

export const MemoryDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    cleanup: cleanupManager.getStats(),
    pool: exerciseCardPool.getPoolStats(),
    concurrency: concurrencyManager.getStats()
  });
  const { memoryPressure, isHighMemoryUsage } = useMemoryPressure();

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cleanup: cleanupManager.getStats(),
        pool: exerciseCardPool.getPoolStats(),
        concurrency: concurrencyManager.getStats()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 hover:bg-gray-700"
        size="sm"
      >
        Memory Debug
      </Button>
    );
  }

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

  const handlePauseConcurrency = () => {
    concurrencyManager.pause();
  };

  const handleResumeConcurrency = () => {
    concurrencyManager.resume();
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto bg-gray-900 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-white">Memory Debug Panel</CardTitle>
          <Button 
            onClick={() => setIsVisible(false)} 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-300">Memory Pressure:</span>
            <Badge 
              variant={memoryPressure === 'high' ? 'destructive' : memoryPressure === 'medium' ? 'secondary' : 'default'}
            >
              {memoryPressure}
            </Badge>
          </div>
          {isHighMemoryUsage && (
            <div className="text-red-400 text-xs">⚠ High memory usage detected</div>
          )}
        </div>

        <div>
          <div className="text-gray-300 mb-1">Concurrency Manager:</div>
          <div className="text-gray-400">
            • Running: {stats.concurrency.running}
            <br />
            • Queued: {stats.concurrency.queued}
            <br />
            • Completed: {stats.concurrency.completed}
            <br />
            • Failed: {stats.concurrency.failed}
            <br />
            • Cancelled: {stats.concurrency.cancelled}
            <br />
            • Memory Pressure: {stats.concurrency.memoryPressure}
          </div>
        </div>

        <div>
          <div className="text-gray-300 mb-1">Cleanup Manager:</div>
          <div className="text-gray-400">
            • Active scopes: {stats.cleanup.activeScopes}
            <br />
            • Global cleanups: {stats.cleanup.globalCleanups}
          </div>
        </div>

        <div>
          <div className="text-gray-300 mb-1">Exercise Card Pool:</div>
          <div className="text-gray-400">
            • Total: {stats.pool.totalCards}
            <br />
            • In use: {stats.pool.inUse}
            <br />
            • Available: {stats.pool.available}
          </div>
        </div>

        <div>
          <div className="text-gray-300 mb-1">Network Cache:</div>
          <div className="text-gray-400">
            • Cached entries: {stats.network.size}
            <br />
            • Max size: {stats.network.maxSize}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleForceCleanup} 
            size="sm" 
            variant="outline"
            className="text-xs"
          >
            Force Cleanup
          </Button>
          <Button 
            onClick={handleForceGC} 
            size="sm" 
            variant="outline"
            className="text-xs"
          >
            Force GC
          </Button>
          <Button 
            onClick={handlePauseConcurrency} 
            size="sm" 
            variant="outline"
            className="text-xs"
          >
            Pause Tasks
          </Button>
          <Button 
            onClick={handleResumeConcurrency} 
            size="sm" 
            variant="outline"
            className="text-xs"
          >
            Resume Tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
