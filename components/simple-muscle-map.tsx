'use client';

import React from 'react';

interface SimpleMuscleMapProps {
  muscleEngagement?: Record<string, number>;
  className?: string;
}

export function SimpleMuscleMap({ muscleEngagement, className = "" }: SimpleMuscleMapProps) {
  // Get engagement level for a muscle
  const getEngagementLevel = (muscleName: string): number => {
    if (!muscleEngagement) return 0;
    
    // Check for exact match first
    if (muscleEngagement[muscleName]) {
      return muscleEngagement[muscleName];
    }
    
    // Check for partial matches (case insensitive)
    const lowerMuscleName = muscleName.toLowerCase();
    for (const [key, value] of Object.entries(muscleEngagement)) {
      if (key.toLowerCase().includes(lowerMuscleName) || lowerMuscleName.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return 0;
  };

  // Get color based on engagement level
  const getEngagementColor = (engagement: number): string => {
    if (engagement >= 70) return '#ef4444'; // red-500
    if (engagement >= 40) return '#f97316'; // orange-500
    if (engagement >= 20) return '#eab308'; // yellow-500
    if (engagement >= 5) return '#6b7280';  // gray-500
    return '#e5e7eb'; // gray-200 (no engagement)
  };

  // Muscle groups and their engagement levels
  const muscles = {
    chest: getEngagementLevel('chest'),
    shoulders: Math.max(getEngagementLevel('shoulders'), getEngagementLevel('deltoids')),
    triceps: getEngagementLevel('triceps'),
    biceps: getEngagementLevel('biceps'),
    back: Math.max(getEngagementLevel('back'), getEngagementLevel('lats'), getEngagementLevel('rhomboids')),
    abs: Math.max(getEngagementLevel('abs'), getEngagementLevel('core')),
    quads: Math.max(getEngagementLevel('quads'), getEngagementLevel('quadriceps')),
    glutes: getEngagementLevel('glutes'),
    hamstrings: getEngagementLevel('hamstrings'),
    calves: getEngagementLevel('calves')
  };

  return (
    <div className={`p-4 bg-white rounded-lg border ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-center">Muscle Activation Map</h3>
      
      {/* Simple body diagram using CSS shapes and positioning */}
      <div className="relative mx-auto" style={{ width: '200px', height: '400px' }}>
        {/* Head */}
        <div 
          className="absolute rounded-full border-2 border-gray-300"
          style={{ 
            width: '40px', 
            height: '40px', 
            top: '0px', 
            left: '80px',
            backgroundColor: '#f3f4f6'
          }}
        />
        
        {/* Shoulders */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '120px', 
            height: '20px', 
            top: '40px', 
            left: '40px',
            backgroundColor: getEngagementColor(muscles.shoulders)
          }}
          title={`Shoulders: ${muscles.shoulders}%`}
        />
        
        {/* Chest */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '80px', 
            height: '40px', 
            top: '60px', 
            left: '60px',
            backgroundColor: getEngagementColor(muscles.chest)
          }}
          title={`Chest: ${muscles.chest}%`}
        />
        
        {/* Arms */}
        {/* Left Bicep */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '25px', 
            height: '60px', 
            top: '60px', 
            left: '25px',
            backgroundColor: getEngagementColor(muscles.biceps)
          }}
          title={`Biceps: ${muscles.biceps}%`}
        />
        
        {/* Right Bicep */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '25px', 
            height: '60px', 
            top: '60px', 
            left: '150px',
            backgroundColor: getEngagementColor(muscles.biceps)
          }}
          title={`Biceps: ${muscles.biceps}%`}
        />
        
        {/* Left Tricep */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '20px', 
            height: '50px', 
            top: '70px', 
            left: '15px',
            backgroundColor: getEngagementColor(muscles.triceps)
          }}
          title={`Triceps: ${muscles.triceps}%`}
        />
        
        {/* Right Tricep */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '20px', 
            height: '50px', 
            top: '70px', 
            left: '165px',
            backgroundColor: getEngagementColor(muscles.triceps)
          }}
          title={`Triceps: ${muscles.triceps}%`}
        />
        
        {/* Back (behind torso, shown as outline) */}
        <div 
          className="absolute rounded-lg border-2 border-dashed"
          style={{ 
            width: '70px', 
            height: '80px', 
            top: '65px', 
            left: '65px',
            backgroundColor: getEngagementColor(muscles.back),
            opacity: 0.7
          }}
          title={`Back: ${muscles.back}%`}
        />
        
        {/* Abs */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '60px', 
            height: '60px', 
            top: '110px', 
            left: '70px',
            backgroundColor: getEngagementColor(muscles.abs)
          }}
          title={`Abs: ${muscles.abs}%`}
        />
        
        {/* Glutes */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '70px', 
            height: '30px', 
            top: '180px', 
            left: '65px',
            backgroundColor: getEngagementColor(muscles.glutes)
          }}
          title={`Glutes: ${muscles.glutes}%`}
        />
        
        {/* Left Quad */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '30px', 
            height: '80px', 
            top: '220px', 
            left: '55px',
            backgroundColor: getEngagementColor(muscles.quads)
          }}
          title={`Quads: ${muscles.quads}%`}
        />
        
        {/* Right Quad */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '30px', 
            height: '80px', 
            top: '220px', 
            left: '115px',
            backgroundColor: getEngagementColor(muscles.quads)
          }}
          title={`Quads: ${muscles.quads}%`}
        />
        
        {/* Left Hamstring (behind quad, shown as outline) */}
        <div 
          className="absolute rounded-lg border-2 border-dashed"
          style={{ 
            width: '25px', 
            height: '70px', 
            top: '225px', 
            left: '57px',
            backgroundColor: getEngagementColor(muscles.hamstrings),
            opacity: 0.7
          }}
          title={`Hamstrings: ${muscles.hamstrings}%`}
        />
        
        {/* Right Hamstring */}
        <div 
          className="absolute rounded-lg border-2 border-dashed"
          style={{ 
            width: '25px', 
            height: '70px', 
            top: '225px', 
            left: '117px',
            backgroundColor: getEngagementColor(muscles.hamstrings),
            opacity: 0.7
          }}
          title={`Hamstrings: ${muscles.hamstrings}%`}
        />
        
        {/* Left Calf */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '25px', 
            height: '60px', 
            top: '310px', 
            left: '57px',
            backgroundColor: getEngagementColor(muscles.calves)
          }}
          title={`Calves: ${muscles.calves}%`}
        />
        
        {/* Right Calf */}
        <div 
          className="absolute rounded-lg border"
          style={{ 
            width: '25px', 
            height: '60px', 
            top: '310px', 
            left: '117px',
            backgroundColor: getEngagementColor(muscles.calves)
          }}
          title={`Calves: ${muscles.calves}%`}
        />
      </div>
      
      {/* Legend */}
      <div className="mt-4 text-center">
        <div className="flex justify-center items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>70%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
            <span>40-69%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
            <span>20-39%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6b7280' }}></div>
            <span>5-19%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
            <span>0%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Hover over muscles to see engagement percentages</p>
      </div>
    </div>
  );
}
