
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useRLSMonitor } from '@/hooks/useRLSMonitor';

export const RLSSecurityPanel: React.FC = () => {
  const {
    auditResults,
    workoutSessionsValidation,
    testResults,
    isLoading,
    lastChecked,
    runFullAudit
  } = useRLSMonitor();

  const getSecurityStatus = () => {
    if (!workoutSessionsValidation) return 'unknown';
    return workoutSessionsValidation.isSecure ? 'secure' : 'vulnerable';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'vulnerable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'bg-green-500';
      case 'vulnerable':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">RLS Security Monitor</h2>
        </div>
        <Button onClick={runFullAudit} disabled={isLoading}>
          {isLoading ? 'Running Audit...' : 'Run Security Audit'}
        </Button>
      </div>

      {lastChecked && (
        <p className="text-sm text-gray-500">
          Last checked: {lastChecked.toLocaleString()}
        </p>
      )}

      {/* Overall Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(getSecurityStatus())}
            Overall Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={getStatusColor(getSecurityStatus())}>
            {getSecurityStatus().toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      {/* Workout Sessions Validation */}
      {workoutSessionsValidation && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Sessions RLS Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workoutSessionsValidation.issues.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Issues Found:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {workoutSessionsValidation.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {workoutSessionsValidation.recommendations.length > 0 && (
              <Alert>
                <AlertDescription>
                  <strong>Recommendations:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {workoutSessionsValidation.recommendations.map((rec, index) => (
                      <li key={index} className="font-mono text-sm">{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Security Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Badge variant="outline" className="text-green-600">
                Passed: {testResults.passed}
              </Badge>
              <Badge variant="outline" className="text-red-600">
                Failed: {testResults.failed}
              </Badge>
              <Badge variant="outline">
                Total: {testResults.total}
              </Badge>
            </div>

            <div className="space-y-2">
              {testResults.results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{result.test.name}</div>
                    <div className="text-sm text-gray-500">{result.test.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Results */}
      {auditResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Table Audit Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditResults.map((audit, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{audit.table}</h4>
                    <Badge variant={audit.hasRLS ? "default" : "destructive"}>
                      {audit.hasRLS ? "RLS Enabled" : "RLS Disabled"}
                    </Badge>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>Policies: {audit.policies.length}</div>
                    <div className="flex gap-2">
                      <span>Own Data Access:</span>
                      {audit.testResults.canAccessOwnData ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span>Others Data Blocked:</span>
                      {audit.testResults.cannotAccessOthersData ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {audit.testResults.error && (
                      <div className="text-red-500">Error: {audit.testResults.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
