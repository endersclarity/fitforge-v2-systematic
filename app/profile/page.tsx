'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, User, Target, Dumbbell, Calendar, Settings } from 'lucide-react';

interface UserProfile {
  name: string;
  age: number;
  primaryGoal: string;
  experienceLevel: string;
  weeklyWorkouts: number;
  availableEquipment: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user profile from localStorage with migration
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        
        // Check if profile needs migration from old format
        const needsMigration = parsedProfile.goal || parsedProfile.experience || parsedProfile.frequency;
        
        if (needsMigration) {
          console.log('🔄 Migrating profile data from old format...');
          const migratedProfile = {
            ...parsedProfile,
            // Migrate old field names to new field names
            primaryGoal: parsedProfile.goal || parsedProfile.primaryGoal,
            experienceLevel: parsedProfile.experience || parsedProfile.experienceLevel,
            weeklyWorkouts: parsedProfile.frequency || parsedProfile.weeklyWorkouts,
          };
          
          // Remove old field names
          delete migratedProfile.goal;
          delete migratedProfile.experience;
          delete migratedProfile.frequency;
          
          // Save migrated data back to localStorage
          localStorage.setItem('userProfile', JSON.stringify(migratedProfile));
          console.log('✅ Profile migration complete:', migratedProfile);
          setProfile(migratedProfile);
        } else {
          setProfile(parsedProfile);
        }
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleEditProfile = () => {
    // Navigate to intake form to re-do setup
    router.push('/intake');
  };

  const getGoalColor = (goal: string) => {
    if (!goal) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    switch (goal.toLowerCase()) {
      case 'build muscle':
      case 'muscle gain':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'lose weight':
      case 'weight loss':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'get stronger':
      case 'strength':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'general fitness':
      case 'stay healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getExperienceColor = (level: string) => {
    if (!level) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'intermediate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fitbod-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitbod-accent mx-auto mb-4"></div>
          <p className="text-fitbod-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-fitbod-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-fitbod-card border-fitbod-subtle">
          <CardContent className="text-center p-8">
            <User className="h-16 w-16 mx-auto mb-4 text-fitbod-text-secondary" />
            <h2 className="text-xl font-semibold text-fitbod-text mb-2">No Profile Found</h2>
            <p className="text-fitbod-text-secondary mb-6">
              It looks like you haven't completed your intake form yet.
            </p>
            <Button 
              onClick={() => router.push('/intake')}
              className="w-full bg-fitbod-accent hover:bg-red-600 text-white"
            >
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
              <h1 className="text-3xl font-bold text-fitbod-text">Your Profile</h1>
              <p className="text-fitbod-text-secondary">
                View and manage your fitness profile
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleEditProfile}
            className="bg-fitbod-accent hover:bg-red-600 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-fitbod-text">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-fitbod-text-secondary">Name</label>
                <p className="text-lg font-semibold text-fitbod-text">{profile.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-fitbod-text-secondary">Age</label>
                <p className="text-lg font-semibold text-fitbod-text">{profile.age} years old</p>
              </div>
            </CardContent>
          </Card>

          {/* Fitness Goals */}
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-fitbod-text">
                <Target className="h-5 w-5" />
                Fitness Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`text-sm px-3 py-1 ${getGoalColor(profile.primaryGoal)}`}>
                {profile.primaryGoal}
              </Badge>
              <p className="text-sm text-fitbod-text-secondary mt-2">
                Your workouts are optimized for this goal
              </p>
            </CardContent>
          </Card>

          {/* Experience Level */}
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-fitbod-text">
                <Dumbbell className="h-5 w-5" />
                Experience Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`text-sm px-3 py-1 ${getExperienceColor(profile.experienceLevel)}`}>
                {profile.experienceLevel}
              </Badge>
              <p className="text-sm text-fitbod-text-secondary mt-2">
                Exercise difficulty is tailored to your level
              </p>
            </CardContent>
          </Card>

          {/* Workout Frequency */}
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-fitbod-text">
                <Calendar className="h-5 w-5" />
                Workout Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-fitbod-text">
                {profile.weeklyWorkouts} 
                <span className="text-sm font-normal text-fitbod-text-secondary ml-1">
                  workouts per week
                </span>
              </p>
              <p className="text-sm text-fitbod-text-secondary mt-2">
                Volume recommendations based on your schedule
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Equipment */}
        <Card className="bg-fitbod-card border-fitbod-subtle mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fitbod-text">
              <Settings className="h-5 w-5" />
              Available Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.availableEquipment.map((equipment, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-fitbod-text border-fitbod-subtle"
                >
                  {equipment}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-fitbod-text-secondary mt-3">
              Exercise recommendations are filtered to your available equipment
            </p>
          </CardContent>
        </Card>

        {/* Profile Usage Info */}
        <Card className="bg-fitbod-card border-fitbod-subtle mt-6">
          <CardHeader>
            <CardTitle className="text-fitbod-text">How Your Profile is Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-fitbod-text-secondary">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-fitbod-accent rounded-full mt-2"></div>
                <p><strong>Workout Recommendations:</strong> Exercise selection is filtered by your equipment and tailored to your experience level</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-fitbod-accent rounded-full mt-2"></div>
                <p><strong>Progressive Overload:</strong> Weight and rep recommendations are calculated based on your goals and experience</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-fitbod-accent rounded-full mt-2"></div>
                <p><strong>Muscle Fatigue:</strong> Recovery calculations consider your weekly workout frequency</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-fitbod-accent rounded-full mt-2"></div>
                <p><strong>Dashboard:</strong> Your personalized welcome message and fitness insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}