'use client';

import React from 'react';
import { WorkoutHistoryAnalyzer } from '@/components/workout-history-analyzer-adapted';
import { VolumeProgressionCalculator } from '@/components/volume-progression-calculator-adapted';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white border-[#3C3C3E]">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 Workout Analytics
          </h1>
          <p className="text-lg text-[#A1A1A3] max-w-2xl mx-auto">
            Deep insights into your training patterns and progress
          </p>
        </div>

        <WorkoutHistoryAnalyzer />

        {/* Volume Progression Calculator */}
        <div className="mt-8">
          <VolumeProgressionCalculator />
        </div>

        {/* Add placeholder for future analytics components */}
        <div className="mt-8 p-6 border border-[#2C2C2E] bg-[#1C1C1E]/50 rounded-xl text-center">
          <p className="text-[#A1A1A3]">
            More analytics coming soon: Muscle Balance Analysis and Strength Charts
          </p>
        </div>
      </div>
    </div>
  );
}
