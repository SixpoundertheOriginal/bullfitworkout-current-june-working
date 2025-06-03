
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { performanceMonitor } from '@/services/performanceMonitor';
import { Activity, Database, HardDrive, Zap } from 'lucide-react';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const report = performanceMonitor.generateReport();
      setMetrics(report);
    }
  }, [isVisible]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
  };

  const getPerformanceRating = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return { rating: 'good', color: 'text-green-400' };
    if (value <= thresholds[1]) return { rating: 'needs-improvement', color: 'text-yellow-400' };
    return { rating: 'poor', color: 'text-red-400' };
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={toggleVisibility}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg"
          size="sm"
        >
          <Activity className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleVisibility} />
      <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-400" />
            Performance Monitor
          </h3>
          <Button 
            onClick={toggleVisibility}
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>

        {metrics && (
          <div className="p-4 space-y-4">
            {/* Core Web Vitals */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {metrics.coreWebVitals.lcp && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">LCP</span>
                    <span className={`text-xs ${getPerformanceRating(metrics.coreWebVitals.lcp, [2500, 4000]).color}`}>
                      {metrics.coreWebVitals.lcp.toFixed(0)}ms
                    </span>
                  </div>
                )}
                {metrics.coreWebVitals.fcp && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">FCP</span>
                    <span className={`text-xs ${getPerformanceRating(metrics.coreWebVitals.fcp, [1800, 3000]).color}`}>
                      {metrics.coreWebVitals.fcp.toFixed(0)}ms
                    </span>
                  </div>
                )}
                {metrics.coreWebVitals.cls && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">CLS</span>
                    <span className={`text-xs ${getPerformanceRating(metrics.coreWebVitals.cls, [0.05, 0.1]).color}`}>
                      {metrics.coreWebVitals.cls.toFixed(3)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Query Performance */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Database className="h-4 w-4 mr-2 text-blue-400" />
                  Query Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Total Queries</span>
                  <span className="text-xs text-green-400">{metrics.queryMetrics.totalQueries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Cache Hit Ratio</span>
                  <span className="text-xs text-green-400">
                    {(metrics.queryMetrics.cacheHitRatio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Avg Duration</span>
                  <span className="text-xs text-blue-400">
                    {metrics.queryMetrics.queryDuration.length > 0 ? 
                      (metrics.queryMetrics.queryDuration.reduce((a: number, b: number) => a + b, 0) / 
                       metrics.queryMetrics.queryDuration.length).toFixed(2) : '0'}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Background Refreshes</span>
                  <span className="text-xs text-purple-400">{metrics.queryMetrics.backgroundRefreshCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <HardDrive className="h-4 w-4 mr-2 text-red-400" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Used Heap</span>
                  <span className="text-xs text-orange-400">
                    {formatBytes(metrics.memoryMetrics.usedJSHeapSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Total Heap</span>
                  <span className="text-xs text-blue-400">
                    {formatBytes(metrics.memoryMetrics.totalJSHeapSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Pressure</span>
                  <span className={`text-xs ${
                    metrics.memoryMetrics.memoryPressure === 'low' ? 'text-green-400' :
                    metrics.memoryMetrics.memoryPressure === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {metrics.memoryMetrics.memoryPressure}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Render Performance */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Render Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Components</span>
                  <span className="text-xs text-green-400">{metrics.renderMetrics.componentRenders.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Unnecessary Renders</span>
                  <span className="text-xs text-red-400">{metrics.renderMetrics.unnecessaryRenders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Avg Render Time</span>
                  <span className="text-xs text-blue-400">
                    {metrics.renderMetrics.renderDuration.length > 0 ? 
                      (metrics.renderMetrics.renderDuration.reduce((a: number, b: number) => a + b, 0) / 
                       metrics.renderMetrics.renderDuration.length).toFixed(2) : '0'}ms
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="pt-2 border-t border-gray-800">
              <Button 
                onClick={() => setMetrics(performanceMonitor.generateReport())}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                Refresh Metrics
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
