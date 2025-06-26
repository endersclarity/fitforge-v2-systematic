'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Database, Trash2 } from 'lucide-react';

export default function DebugStoragePage() {
  const router = useRouter();
  const [storageData, setStorageData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = () => {
    const keys = [
      'fitforge-workout-history',
      'workoutSessions', 
      'fitforge-workout-session',
      'userProfile',
      'currentWorkoutSession',
      'workoutSetHistory'
    ];

    const data: Record<string, any> = {};
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value; // If it's not JSON, store as string
        }
      } else {
        data[key] = null;
      }
    });

    setStorageData(data);
  };

  const clearStorage = (key: string) => {
    localStorage.removeItem(key);
    loadStorageData(); // Refresh
  };

  const clearAllStorage = () => {
    Object.keys(storageData).forEach(key => {
      localStorage.removeItem(key);
    });
    loadStorageData();
  };

  const formatValue = (value: any) => {
    if (value === null) return 'null';
    if (typeof value === 'string') return value;
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="bg-fitbod-card border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-fitbod-text">localStorage Debug</h1>
              <p className="text-fitbod-text-secondary">
                View and manage stored workout data
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={loadStorageData} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={clearAllStorage} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {Object.entries(storageData).map(([key, value]) => (
            <Card key={key} className="bg-fitbod-card border-fitbod-subtle">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-fitbod-text font-mono">{key}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-fitbod-text-secondary">
                      {value ? (Array.isArray(value) ? `${value.length} items` : 'Object') : 'Empty'}
                    </span>
                    <Button 
                      onClick={() => clearStorage(key)} 
                      variant="outline" 
                      size="sm"
                      disabled={!value}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-fitbod-text-secondary bg-fitbod-background p-4 rounded border overflow-auto max-h-96">
                  {formatValue(value)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-fitbod-card border-fitbod-subtle">
          <CardHeader>
            <CardTitle className="text-fitbod-text">Workout Data Flow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-fitbod-text-secondary space-y-2">
            <p><strong>fitforge-workout-history:</strong> Completed workouts from workout execution flow</p>
            <p><strong>workoutSessions:</strong> Completed workouts from WorkoutLogger component</p>
            <p><strong>fitforge-workout-session:</strong> Current/temporary workout session data</p>
            <p><strong>userProfile:</strong> User's intake form data (name, goals, equipment)</p>
            <p><strong>currentWorkoutSession:</strong> Active workout session in WorkoutLogger</p>
            <p><strong>workoutSetHistory:</strong> Individual set completion history</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}