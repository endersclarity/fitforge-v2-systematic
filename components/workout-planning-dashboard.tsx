"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, Brain, Calculator, Sparkles, TrendingUp, CheckCircle } from "lucide-react"

import { TargetMuscleSelector } from "./target-muscle-selector"
import { ExerciseGapAnalyzer } from "./exercise-gap-analyzer"
import { FatigueCalculator } from "./fatigue-calculator"
import { AutoWorkoutCompleter } from "./auto-workout-completer"

interface WorkoutPlanningDashboardProps {
  className?: string
}

export function WorkoutPlanningDashboard({ className }: WorkoutPlanningDashboardProps) {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [fatigueStatus, setFatigueStatus] = useState<Record<string, number>>({})
  const [fatigueTargets, setFatigueTargets] = useState<any[]>([])
  const [exerciseRecommendations, setExerciseRecommendations] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState<'select' | 'analyze' | 'calculate' | 'complete'>('select')

  const handleMuscleSelectionChange = (muscles: string[], fatigue: Record<string, number>) => {
    setSelectedMuscles(muscles)
    setFatigueStatus(fatigue)
    
    if (muscles.length > 0) {
      setCurrentStep('analyze')
    } else {
      setCurrentStep('select')
    }
  }

  const handleFatigueTargetsCalculated = (targets: any[]) => {
    setFatigueTargets(targets)
    if (targets.length > 0) {
      setCurrentStep('complete')
    }
  }

  const handleExerciseRecommendations = (recommendations: any[]) => {
    setExerciseRecommendations(recommendations)
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'select': return <Target className="h-4 w-4" />
      case 'analyze': return <Brain className="h-4 w-4" />
      case 'calculate': return <Calculator className="h-4 w-4" />
      case 'complete': return <Sparkles className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getStepStatus = (step: string): 'completed' | 'active' | 'pending' => {
    const stepOrder = ['select', 'analyze', 'calculate', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(step)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getWorkoutReadiness = (): { status: string, message: string, color: string } => {
    if (selectedMuscles.length === 0) {
      return {
        status: 'Not Started',
        message: 'Select target muscle groups to begin workout planning',
        color: 'text-gray-600'
      }
    }
    
    if (fatigueTargets.length === 0) {
      return {
        status: 'In Progress',
        message: 'Analyzing muscle selection and calculating optimal fatigue targets',
        color: 'text-blue-600'
      }
    }

    const optimalMuscles = fatigueTargets.filter(target => 
      target.fatigueStatus === 'optimal' || target.fatigueStatus === 'undertrained'
    ).length

    const totalMuscles = fatigueTargets.length

    if (optimalMuscles === totalMuscles) {
      return {
        status: 'Optimal',
        message: 'All target muscles are ready for training with optimal recovery',
        color: 'text-green-600'
      }
    } else if (optimalMuscles >= totalMuscles * 0.7) {
      return {
        status: 'Good',
        message: `${optimalMuscles}/${totalMuscles} muscle groups ready for optimal training`,
        color: 'text-yellow-600'
      }
    } else {
      return {
        status: 'Caution',
        message: 'Several muscle groups may need additional recovery time',
        color: 'text-red-600'
      }
    }
  }

  const workoutReadiness = getWorkoutReadiness()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Intelligent Workout Planning
              </CardTitle>
              <CardDescription>
                AI-powered workout optimization to reach 100% muscle fatigue targets
              </CardDescription>
            </div>
            <Badge variant="outline" className={workoutReadiness.color}>
              {workoutReadiness.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-4">
            {[
              { key: 'select', label: 'Select Muscles' },
              { key: 'analyze', label: 'Analyze Gaps' },
              { key: 'calculate', label: 'Calculate Fatigue' },
              { key: 'complete', label: 'Complete Workout' }
            ].map((step, index) => {
              const status = getStepStatus(step.key)
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    status === 'completed' ? 'border-green-500 bg-green-500 text-white' :
                    status === 'active' ? 'border-blue-500 bg-blue-500 text-white' :
                    'border-gray-300 bg-gray-100 text-gray-500'
                  }`}>
                    {status === 'completed' ? <CheckCircle className="h-4 w-4" /> : getStepIcon(step.key)}
                  </div>
                  <span className={`ml-2 text-sm ${
                    status === 'active' ? 'font-medium text-blue-600' :
                    status === 'completed' ? 'font-medium text-green-600' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`mx-4 w-12 h-0.5 ${
                      getStepStatus(['select', 'analyze', 'calculate', 'complete'][index + 1]) === 'completed' ? 
                      'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Readiness Status */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>{workoutReadiness.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Planning Interface */}
      <Tabs value={currentStep} onValueChange={setCurrentStep}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="select" disabled={getStepStatus('select') === 'pending'}>
            Target Muscles
          </TabsTrigger>
          <TabsTrigger value="analyze" disabled={selectedMuscles.length === 0}>
            Gap Analysis
          </TabsTrigger>
          <TabsTrigger value="calculate" disabled={selectedMuscles.length === 0}>
            Fatigue Calculator
          </TabsTrigger>
          <TabsTrigger value="complete" disabled={fatigueTargets.length === 0}>
            Auto-Complete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-4">
          <TargetMuscleSelector
            onMuscleSelectionChange={handleMuscleSelectionChange}
          />
          
          {selectedMuscles.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('analyze')}>
                Analyze Selected Muscles
                <Target className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <ExerciseGapAnalyzer
            targetMuscles={selectedMuscles}
            onExerciseRecommendations={handleExerciseRecommendations}
          />
          
          {exerciseRecommendations.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('calculate')}>
                Calculate Fatigue Targets
                <Calculator className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calculate" className="space-y-4">
          <FatigueCalculator
            targetMuscles={selectedMuscles}
            onFatigueTargetsCalculated={handleFatigueTargetsCalculated}
          />
          
          {fatigueTargets.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('complete')}>
                Auto-Complete Workout
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          <AutoWorkoutCompleter
            targetMuscles={selectedMuscles}
            fatigueTargets={fatigueTargets}
            exerciseRecommendations={exerciseRecommendations}
          />
        </TabsContent>
      </Tabs>

      {/* Summary Panel */}
      {selectedMuscles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planning Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Target Muscles</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedMuscles.map(muscle => (
                    <Badge key={muscle} variant="secondary">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Fatigue Status</h4>
                <div className="space-y-1">
                  {Object.entries(fatigueStatus).map(([muscle, fatigue]) => (
                    <div key={muscle} className="flex justify-between text-sm">
                      <span>{muscle}</span>
                      <span>{fatigue}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recommendations</h4>
                <div className="text-sm text-muted-foreground">
                  {exerciseRecommendations.length > 0 
                    ? `${exerciseRecommendations.length} exercises recommended`
                    : 'Complete analysis for recommendations'
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {fatigueTargets.length > 0 
                    ? `${fatigueTargets.filter(t => t.fatigueStatus === 'optimal').length}/${fatigueTargets.length} muscles ready`
                    : 'Calculate fatigue for readiness'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}