"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Target, Dumbbell, Clock, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { userProfileService, CreateUserProfileData } from "@/lib/user-profile-service"

// Development user ID (replace with actual auth when implemented)
const DEVELOPMENT_USER_ID = '00000000-0000-4000-8000-000000000001'

interface UserProfile {
  // Basic Info
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  
  // Physical Stats
  bodyWeight: number
  heightFeet: number
  heightInches: number
  bodyFatPercentage?: number
  
  // Fitness Goals
  primaryGoal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness'
  weeklyWorkouts: number
  sessionDuration: number // minutes
  
  // Experience Level
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  yearsTraining: number
  
  // Equipment Access
  availableEquipment: string[]
  
  // Max Weight Estimates (for key exercises)
  maxWeights: {
    [exerciseName: string]: number
  }
  
  // Preferences
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening' | 'flexible'
  restDayPreference: string[]
  
  // Health & Limitations
  injuries: string
  medicalConditions: string
  
  // Motivation
  motivationLevel: number // 1-10
  notes: string
}

// Equipment options now loaded dynamically from database

// Dynamic exercise loading based on user's available equipment
interface Exercise {
  id: string
  name: string
  equipment: string
  category: string
}

export function UserIntakeForm() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    availableEquipment: [],
    maxWeights: {},
    restDayPreference: []
  })
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([])
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false)
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [isLoadingExercises, setIsLoadingExercises] = useState(false)

  // Load existing profile and equipment on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setIsLoadingEquipment(true)
      try {
        // Load profile and equipment in parallel
        const [existingProfile, equipmentList] = await Promise.all([
          userProfileService.getUserProfile(DEVELOPMENT_USER_ID),
          userProfileService.getAvailableEquipment()
        ])

        setAvailableEquipment(equipmentList)
        
        if (existingProfile) {
          // Map Supabase format back to form format
          setProfile({
            name: existingProfile.name || '',
            age: existingProfile.age || 0,
            gender: existingProfile.gender || 'male',
            bodyWeight: existingProfile.weight_lbs || 0,
            heightFeet: Math.floor((existingProfile.height_inches || 0) / 12),
            heightInches: (existingProfile.height_inches || 0) % 12,
            bodyFatPercentage: existingProfile.body_fat_percentage,
            primaryGoal: existingProfile.primary_goal || 'general_fitness',
            weeklyWorkouts: existingProfile.weekly_workout_frequency || 3,
            sessionDuration: existingProfile.preferred_workout_duration || 60,
            experienceLevel: existingProfile.experience_level || 'beginner',
            yearsTraining: 0, // Not stored in Supabase yet
            availableEquipment: existingProfile.available_equipment || [],
            maxWeights: {}, // Not implemented yet
            preferredWorkoutTime: 'flexible', // Extract from notes if needed
            restDayPreference: [], // Extract from notes if needed
            injuries: existingProfile.injury_limitations || ''
          })
          toast.success("Loaded your existing profile!")
        } else {
          // Check for localStorage fallback
          const localProfile = localStorage.getItem("userProfile")
          if (localProfile) {
            const parsed = JSON.parse(localProfile)
            setProfile(parsed)
            toast.info("Found existing profile in localStorage - will migrate to Supabase when saved")
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        // Fallback to localStorage
        const localProfile = localStorage.getItem("userProfile")
        if (localProfile) {
          try {
            const parsed = JSON.parse(localProfile)
            setProfile(parsed)
            toast.info("Loaded profile from localStorage - will migrate to Supabase when saved")
          } catch (parseError) {
            console.error('Error parsing localStorage profile:', parseError)
          }
        }
      } finally {
        setIsLoading(false)
        setIsLoadingEquipment(false)
      }
    }

    loadData()
  }, [])

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }


  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      availableEquipment: checked 
        ? [...(prev.availableEquipment || []), equipment]
        : (prev.availableEquipment || []).filter(e => e !== equipment)
    }))
  }

  const selectAllEquipment = () => {
    setProfile(prev => ({
      ...prev,
      availableEquipment: [...availableEquipment]
    }))
  }

  const deselectAllEquipment = () => {
    setProfile(prev => ({
      ...prev,
      availableEquipment: []
    }))
  }

  const isAllEquipmentSelected = availableEquipment.length > 0 && 
    availableEquipment.every(equipment => profile.availableEquipment?.includes(equipment))

  // Load exercises when user's equipment selection changes
  useEffect(() => {
    const loadExercises = async () => {
      if (!profile.availableEquipment || profile.availableEquipment.length === 0) {
        setAvailableExercises([])
        return
      }

      setIsLoadingExercises(true)
      try {
        const exercises = await userProfileService.getExercisesForEquipment(profile.availableEquipment)
        setAvailableExercises(exercises)
      } catch (error) {
        console.error('Error loading exercises:', error)
        setAvailableExercises([])
      } finally {
        setIsLoadingExercises(false)
      }
    }

    loadExercises()
  }, [profile.availableEquipment])

  const updateExercisePerformance = (exerciseId: string, value: number) => {
    setProfile(prev => ({
      ...prev,
      maxWeights: { ...prev.maxWeights, [exerciseId]: value }
    }))
  }

  const saveProfile = async () => {
    // Validate required fields
    if (!profile.name || !profile.age || !profile.bodyWeight) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    try {
      // Map form data to Supabase format
      const profileData: CreateUserProfileData = {
        user_id: DEVELOPMENT_USER_ID,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height_inches: (profile.heightFeet || 0) * 12 + (profile.heightInches || 0),
        weight_lbs: profile.bodyWeight,
        body_fat_percentage: profile.bodyFatPercentage,
        primary_goal: profile.primaryGoal,
        weekly_workout_frequency: profile.weeklyWorkouts,
        experience_level: profile.experienceLevel,
        preferred_workout_duration: profile.sessionDuration,
        has_home_gym: profile.availableEquipment?.includes('Home Gym') || false,
        has_gym_membership: profile.availableEquipment?.includes('Gym Membership') || false,
        available_equipment: profile.availableEquipment || [],
        injury_limitations: profile.injuries,
        notes: `Training experience: ${profile.yearsTraining} years. Preferred workout time: ${profile.preferredWorkoutTime}. Rest days: ${profile.restDayPreference?.join(', ')}`
      }

      // Save to Supabase (this will calculate BMR/TDEE automatically)
      const savedProfile = await userProfileService.getOrCreateUserProfile(DEVELOPMENT_USER_ID, profileData)
      
      toast.success(`Profile saved successfully! BMR: ${savedProfile.bmr} cal, TDEE: ${savedProfile.tdee} cal`)
      
      // Migrate existing localStorage to Supabase if it exists
      const existingProfile = localStorage.getItem("userProfile")
      if (existingProfile) {
        localStorage.removeItem("userProfile") // Clean up old localStorage
        toast.success("Migrated your profile from localStorage to Supabase!")
      }
      
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={profile.name || ''}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => updateProfile('age', parseInt(e.target.value))}
                  placeholder="25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                value={profile.gender}
                onValueChange={(value) => updateProfile('gender', value)}
              >
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Physical Stats</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Body Weight (lbs) *</Label>
                <Input
                  type="number"
                  value={profile.bodyWeight || ''}
                  onChange={(e) => updateProfile('bodyWeight', parseFloat(e.target.value))}
                  placeholder="150"
                />
              </div>
              <div className="space-y-2">
                <Label>Body Fat % (optional)</Label>
                <Input
                  type="number"
                  value={profile.bodyFatPercentage || ''}
                  onChange={(e) => updateProfile('bodyFatPercentage', parseFloat(e.target.value))}
                  placeholder="15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Height</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={profile.heightFeet || ''}
                  onChange={(e) => updateProfile('heightFeet', parseInt(e.target.value))}
                  placeholder="5"
                  className="w-20"
                />
                <span className="self-center">ft</span>
                <Input
                  type="number"
                  value={profile.heightInches || ''}
                  onChange={(e) => updateProfile('heightInches', parseInt(e.target.value))}
                  placeholder="8"
                  className="w-20"
                />
                <span className="self-center">in</span>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Fitness Goals
            </h3>
            
            <div className="space-y-2">
              <Label>Primary Goal</Label>
              <Select
                value={profile.primaryGoal}
                onValueChange={(value) => updateProfile('primaryGoal', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your main goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Build Strength</SelectItem>
                  <SelectItem value="hypertrophy">Build Muscle (Hypertrophy)</SelectItem>
                  <SelectItem value="endurance">Improve Endurance</SelectItem>
                  <SelectItem value="weight_loss">Lose Weight</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workouts per Week</Label>
                <Select
                  value={profile.weeklyWorkouts?.toString()}
                  onValueChange={(value) => updateProfile('weeklyWorkouts', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="4">4 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="6">6 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Session Duration (minutes)</Label>
                <Select
                  value={profile.sessionDuration?.toString()}
                  onValueChange={(value) => updateProfile('sessionDuration', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="75">75 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Experience Level
            </h3>
            
            <div className="space-y-2">
              <Label>Training Experience</Label>
              <RadioGroup
                value={profile.experienceLevel}
                onValueChange={(value) => updateProfile('experienceLevel', value)}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner">Beginner (0-1 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate (1-3 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Advanced (3+ years)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Years of Training</Label>
              <Input
                type="number"
                step="0.5"
                value={profile.yearsTraining || ''}
                onChange={(e) => updateProfile('yearsTraining', parseFloat(e.target.value))}
                placeholder="1.5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Available Equipment</Label>
                {isLoadingEquipment ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading equipment...
                  </div>
                ) : availableEquipment.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllEquipment}
                      disabled={isAllEquipmentSelected}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deselectAllEquipment}
                      disabled={!profile.availableEquipment?.length}
                    >
                      Deselect All
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableEquipment.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={profile.availableEquipment?.includes(equipment)}
                      onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                    />
                    <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                  </div>
                ))}
              </div>
              {availableEquipment.length === 0 && !isLoadingEquipment && (
                <p className="text-sm text-muted-foreground">
                  No equipment data available. Using fallback options.
                </p>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exercise Performance Baselines</h3>
            <p className="text-sm text-muted-foreground">
              Set your current performance levels for exercises based on your available equipment (optional but helpful for progression planning)
            </p>
            
            {profile.availableEquipment?.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please select your available equipment in the previous step to see relevant exercises.
                </p>
              </div>
            ) : isLoadingExercises ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading exercises for your equipment...</span>
              </div>
            ) : availableExercises.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  No exercises found for your selected equipment. This section will be populated once you select equipment.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {Object.entries(
                    availableExercises.reduce((groups, exercise) => {
                      if (!groups[exercise.category]) groups[exercise.category] = []
                      groups[exercise.category].push(exercise)
                      return groups
                    }, {} as Record<string, Exercise[]>)
                  ).map(([category, exercises]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 border-b pb-1">
                        {category}
                      </h4>
                      <div className="grid gap-2">
                        {exercises.map((exercise) => {
                          const isWeighted = userProfileService.isWeightedExercise(exercise.equipment)
                          return (
                            <div key={exercise.id} className="flex items-center justify-between py-1">
                              <div className="flex-1">
                                <Label className="text-sm">{exercise.name}</Label>
                                <div className="text-xs text-muted-foreground">
                                  {exercise.equipment} • {isWeighted ? '1RM Weight' : 'Max Reps'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={profile.maxWeights?.[exercise.id] || ''}
                                  onChange={(e) => updateExercisePerformance(exercise.id, parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-20"
                                  min="0"
                                  step={isWeighted ? "5" : "1"}
                                />
                                <span className="text-sm text-muted-foreground w-8">
                                  {isWeighted ? 'lbs' : 'reps'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Weight exercises:</strong> Enter your 1-rep max (1RM). 
                    <strong>Bodyweight exercises:</strong> Enter max reps before failure. 
                    Leave blank if unsure - the system will learn from your actual workouts.
                  </p>
                </div>
              </>
            )}
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Workout Time</Label>
                <Select
                  value={profile.preferredWorkoutTime}
                  onValueChange={(value) => updateProfile('preferredWorkoutTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Motivation Level (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={profile.motivationLevel || ''}
                  onChange={(e) => updateProfile('motivationLevel', parseInt(e.target.value))}
                  placeholder="8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Injuries or Limitations</Label>
              <Textarea
                value={profile.injuries || ''}
                onChange={(e) => updateProfile('injuries', e.target.value)}
                placeholder="Any current or past injuries to consider..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={profile.notes || ''}
                onChange={(e) => updateProfile('notes', e.target.value)}
                placeholder="Anything else you'd like to share..."
                rows={2}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Show loading state while profile loads
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading your profile...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Profile Setup</CardTitle>
            <CardDescription>Help us personalize your fitness experience</CardDescription>
          </div>
          <Badge variant="outline">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep === totalSteps ? (
            <Button onClick={saveProfile} disabled={isSaving} className="flex items-center gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Saving to Supabase...' : 'Save Profile'}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}