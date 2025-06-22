'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleMuscleMap } from './simple-muscle-map';

interface MuscleEngagementDisplayProps {
  exerciseName: string;
  muscleEngagement?: Record<string, number>;
  className?: string;
}

export function MuscleEngagementDisplay({ 
  exerciseName, 
  muscleEngagement, 
  className = "" 
}: MuscleEngagementDisplayProps) {
  if (!muscleEngagement || Object.keys(muscleEngagement).length === 0) {
    return (
      <div className={`p-3 bg-gray-50 rounded-md ${className}`}>
        <p className="text-sm text-gray-500">No muscle engagement data available</p>
      </div>
    );
  }

  // Sort muscles by engagement percentage (highest first)
  const sortedMuscles = Object.entries(muscleEngagement)
    .sort(([, a], [, b]) => b - a);

  // Get engagement level color and description
  const getEngagementLevel = (percentage: number) => {
    if (percentage >= 70) return { 
      level: 'Primary', 
      color: 'bg-red-500', 
      textColor: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200'
    };
    if (percentage >= 40) return { 
      level: 'Secondary', 
      color: 'bg-orange-500', 
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200'
    };
    if (percentage >= 20) return { 
      level: 'Supporting', 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50 border-yellow-200'
    };
    return { 
      level: 'Stabilizing', 
      color: 'bg-gray-500', 
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50 border-gray-200'
    };
  };

  // Format muscle names (convert underscores to spaces, capitalize)
  const formatMuscleName = (muscleName: string) => {
    return muscleName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          💪 Muscle Engagement
        </CardTitle>
        <CardDescription>
          {exerciseName} - Muscle activation percentages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Muscle Map */}
        <SimpleMuscleMap muscleEngagement={muscleEngagement} />
        {/* Detailed Breakdown */}
        <div className="space-y-3">
        {/* Primary muscles (70%+) */}
        {sortedMuscles.filter(([, percentage]) => percentage >= 70).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-2">Primary Movers (70%+)</h4>
            <div className="space-y-2">
              {sortedMuscles
                .filter(([, percentage]) => percentage >= 70)
                .map(([muscle, percentage]) => {
                  const engagement = getEngagementLevel(percentage);
                  return (
                    <div key={muscle} className={`p-2 rounded border ${engagement.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{formatMuscleName(muscle)}</span>
                        <Badge variant="outline" className={engagement.textColor}>
                          {percentage}%
                        </Badge>
                      </div>
                      <div className="mt-1 w-full bg-white rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${engagement.color}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Secondary muscles (40-69%) */}
        {sortedMuscles.filter(([, percentage]) => percentage >= 40 && percentage < 70).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-2">Secondary Movers (40-69%)</h4>
            <div className="grid grid-cols-2 gap-2">
              {sortedMuscles
                .filter(([, percentage]) => percentage >= 40 && percentage < 70)
                .map(([muscle, percentage]) => {
                  const engagement = getEngagementLevel(percentage);
                  return (
                    <div key={muscle} className={`p-2 rounded border ${engagement.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{formatMuscleName(muscle)}</span>
                        <span className={`text-xs ${engagement.textColor}`}>{percentage}%</span>
                      </div>
                      <div className="mt-1 w-full bg-white rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${engagement.color}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Supporting muscles (20-39%) */}
        {sortedMuscles.filter(([, percentage]) => percentage >= 20 && percentage < 40).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-700 mb-2">Supporting Muscles (20-39%)</h4>
            <div className="flex flex-wrap gap-1">
              {sortedMuscles
                .filter(([, percentage]) => percentage >= 20 && percentage < 40)
                .map(([muscle, percentage]) => (
                  <Badge key={muscle} variant="outline" className="text-yellow-700 border-yellow-300">
                    {formatMuscleName(muscle)} {percentage}%
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Stabilizing muscles (5-19%) */}
        {sortedMuscles.filter(([, percentage]) => percentage >= 5 && percentage < 20).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Stabilizing Muscles (5-19%)</h4>
            <div className="flex flex-wrap gap-1">
              {sortedMuscles
                .filter(([, percentage]) => percentage >= 5 && percentage < 20)
                .map(([muscle, percentage]) => (
                  <Badge key={muscle} variant="outline" className="text-gray-600 border-gray-300 text-xs">
                    {formatMuscleName(muscle)} {percentage}%
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Total engagement summary */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Total Muscles Engaged:</span>
            <span className="font-medium">{sortedMuscles.length}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Peak Engagement:</span>
            <span className="font-medium">{Math.max(...Object.values(muscleEngagement))}%</span>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
