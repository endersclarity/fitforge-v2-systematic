'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { User, Target, Dumbbell, Save } from "lucide-react"
import { toast } from "sonner"

interface SimpleUserProfile {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  bodyWeight: number
  heightFeet: number
  heightInches: number
  primaryGoal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness'
  weeklyWorkouts: number
  sessionDuration: number
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  availableEquipment: string[]
}

const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbells',
  'Resistance Bands',
  'Pull-up Bar',
  'Bench',
  'Squat Rack',
  'Cable Machine',
  'Kettlebells',
  'Bodyweight Only',
  'Full Gym Access'
]

export function SimpleIntakeForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [isSaving, setIsSaving] = useState(false)

  const [profile, setProfile] = useState<Partial<SimpleUserProfile>>({
    availableEquipment: []
  })

  const updateProfile = (field: keyof SimpleUserProfile, value: any) => {
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

  const saveProfile = async () => {
    // Validate required fields
    if (!profile.name || !profile.age || !profile.bodyWeight) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    
    try {
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile))
      
      console.log('✅ FitForge: User profile saved to localStorage:', profile)
      toast.success("Profile saved successfully! Welcome to FitForge!")
      
      // Navigate to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
    } catch (error) {
      console.error('🚨 FitForge: Error saving profile:', error)
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
          </div>
        )

      case 2:
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

      case 3:
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
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Equipment</h3>
            
            <div className="space-y-2">
              <Label>What equipment do you have access to?</Label>
              <div className="grid grid-cols-2 gap-2">
                {EQUIPMENT_OPTIONS.map((equipment) => (
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
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Get Started with FitForge</CardTitle>
            <CardDescription>Tell us about yourself to personalize your experience</CardDescription>
          </div>
          <Badge variant="outline">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-[#FF375F] h-2 rounded-full transition-all duration-300"
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
              {isSaving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Complete Setup'}
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