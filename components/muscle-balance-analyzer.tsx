"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { Scale, AlertTriangle, Activity, Target, TrendingUp, TrendingDown, CheckCircle } from "lucide-react"

interface MuscleBalanceAnalyzerProps {
  className?: string
}

interface MuscleGroupData {
  name: string
  totalVolume: number
  weeklyVolume: number
  sessions: number
  lastTrained: string
  percentage: number
  status: 'balanced' | 'undertrained' | 'overtrained'
  recommendation: string
}

interface BalanceMetrics {
  overallBalance: number
  imbalanceCount: number
  balancedCount: number
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

interface MuscleGroupTarget {
  name: string
  targetPercentage: number
  currentPercentage: number
  difference: number
}

export function MuscleBalanceAnalyzer({ className }: MuscleBalanceAnalyzerProps) {
  const [timeFrame, setTimeFrame] = useState<string>("30")
  const [analysisType, setAnalysisType] = useState<string>("volume")
  const [muscleData, setMuscleData] = useState<MuscleGroupData[]>([])
  const [balanceMetrics, setBalanceMetrics] = useState<BalanceMetrics | null>(null)
  const [muscleTargets, setMuscleTargets] = useState<MuscleGroupTarget[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    analyzeMuscleBalance()
  }, [timeFrame, analysisType])

  const analyzeMuscleBalance = () => {
    setIsLoading(true)
    
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    
    if (workouts.length === 0) {
      setMuscleData([])
      setBalanceMetrics(null)
      setMuscleTargets([])
      setIsLoading(false)
      return
    }

    // Filter by time frame
    const now = new Date()
    const daysBack = timeFrame === "all" ? 365 : parseInt(timeFrame)
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    const filteredWorkouts = timeFrame === "all" ? workouts : 
      workouts.filter((workout: any) => new Date(workout.date) >= cutoffDate)

    // Define muscle group mappings
    const muscleGroups = {
      'Chest': ['Pectoralis_Major', 'Pectoralis_Minor'],
      'Back': ['Latissimus_Dorsi', 'Rhomboids', 'Middle_Trapezius', 'Lower_Trapezius'],
      'Shoulders': ['Anterior_Deltoid', 'Medial_Deltoid', 'Posterior_Deltoid'],
      'Arms': ['Biceps_Brachii', 'Triceps_Brachii', 'Forearm_Flexors', 'Forearm_Extensors'],
      'Legs': ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
      'Core': ['Rectus_Abdominis', 'Obliques', 'Lower_Back']
    }

    // Calculate muscle group data
    const groupData: Record<string, any> = {}
    
    Object.keys(muscleGroups).forEach(group => {
      groupData[group] = {
        totalVolume: 0,
        sessions: 0,
        lastTrained: null,
        exercises: []
      }
    })

    filteredWorkouts.forEach((workout: any) => {
      const workoutDate = new Date(workout.date)
      
      workout.exercises?.forEach((exercise: any) => {
        const exerciseData = JSON.parse(localStorage.getItem("exercises") || "[]")
        const exerciseInfo = exerciseData.find((ex: any) => ex.Name === exercise.name)
        
        if (exerciseInfo?.muscle_engagement) {
          Object.entries(exerciseInfo.muscle_engagement).forEach(([muscle, engagement]: [string, any]) => {
            if (typeof engagement === 'number' && engagement > 0) {
              // Find which group this muscle belongs to
              const group = Object.entries(muscleGroups).find(([_, muscles]) => 
                muscles.includes(muscle)
              )?.[0]
              
              if (group) {
                const volume = exercise.exerciseVolume || 0
                const weightedVolume = volume * (engagement / 100)
                
                groupData[group].totalVolume += weightedVolume
                if (!groupData[group].lastTrained || workoutDate > new Date(groupData[group].lastTrained)) {
                  groupData[group].lastTrained = workout.date
                }
                
                if (!groupData[group].exercises.includes(exercise.name)) {
                  groupData[group].exercises.push(exercise.name)
                  groupData[group].sessions++
                }
              }
            }
          })
        }
      })
    })

    // Calculate total volume for percentages
    const totalVolume = Object.values(groupData).reduce((sum: number, group: any) => sum + group.totalVolume, 0)

    // Ideal muscle group distribution (based on balanced training)
    const idealDistribution = {
      'Chest': 18,
      'Back': 22,
      'Shoulders': 15,
      'Arms': 20,
      'Legs': 20,
      'Core': 5
    }

    // Generate muscle group analysis
    const analysisData: MuscleGroupData[] = Object.entries(groupData).map(([groupName, data]: [string, any]) => {
      const percentage = totalVolume > 0 ? (data.totalVolume / totalVolume) * 100 : 0
      const idealPercentage = idealDistribution[groupName as keyof typeof idealDistribution]
      const difference = Math.abs(percentage - idealPercentage)
      
      let status: 'balanced' | 'undertrained' | 'overtrained' = 'balanced'
      let recommendation = "Maintain current training volume"
      
      if (percentage < idealPercentage - 5) {
        status = 'undertrained'
        recommendation = `Increase training volume by ${Math.round(idealPercentage - percentage)}%`
      } else if (percentage > idealPercentage + 5) {
        status = 'overtrained'
        recommendation = `Reduce training volume by ${Math.round(percentage - idealPercentage)}%`
      }

      const daysSinceLastTrained = data.lastTrained ? 
        Math.floor((now.getTime() - new Date(data.lastTrained).getTime()) / (1000 * 60 * 60 * 24)) : 999

      if (daysSinceLastTrained > 7 && status === 'balanced') {
        status = 'undertrained'
        recommendation = `Haven't trained in ${daysSinceLastTrained} days - schedule soon`
      }

      return {
        name: groupName,
        totalVolume: Math.round(data.totalVolume),
        weeklyVolume: Math.round(data.totalVolume * (7 / daysBack)),
        sessions: data.sessions,
        lastTrained: data.lastTrained || 'Never',
        percentage: Math.round(percentage * 10) / 10,
        status,
        recommendation
      }
    }).sort((a, b) => b.totalVolume - a.totalVolume)

    // Calculate balance metrics
    const balancedGroups = analysisData.filter(group => group.status === 'balanced').length
    const imbalancedGroups = analysisData.length - balancedGroups
    const overallBalance = (balancedGroups / analysisData.length) * 100

    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (imbalancedGroups >= 4) riskLevel = 'high'
    else if (imbalancedGroups >= 2) riskLevel = 'medium'

    const recommendations = generateRecommendations(analysisData)

    const metrics: BalanceMetrics = {
      overallBalance: Math.round(overallBalance),
      imbalanceCount: imbalancedGroups,
      balancedCount: balancedGroups,
      recommendations,
      riskLevel
    }

    // Generate muscle targets for radar chart
    const targets: MuscleGroupTarget[] = Object.entries(idealDistribution).map(([name, target]) => {
      const current = analysisData.find(group => group.name === name)?.percentage || 0
      return {
        name,
        targetPercentage: target,
        currentPercentage: current,
        difference: current - target
      }
    })

    setMuscleData(analysisData)
    setBalanceMetrics(metrics)
    setMuscleTargets(targets)
    setIsLoading(false)
  }

  const generateRecommendations = (data: MuscleGroupData[]): string[] => {
    const recommendations: string[] = []
    
    const undertrained = data.filter(group => group.status === 'undertrained')
    const overtrained = data.filter(group => group.status === 'overtrained')

    if (undertrained.length > 0) {
      recommendations.push(`Focus on ${undertrained.map(g => g.name.toLowerCase()).join(', ')} in upcoming workouts`)
    }

    if (overtrained.length > 0) {
      recommendations.push(`Consider reducing volume for ${overtrained.map(g => g.name.toLowerCase()).join(', ')}`)
    }

    // Check for specific imbalances
    const chestData = data.find(group => group.name === 'Chest')
    const backData = data.find(group => group.name === 'Back')
    
    if (chestData && backData && chestData.percentage > backData.percentage + 8) {
      recommendations.push("Address chest/back imbalance - add more pulling exercises")
    }

    const legsData = data.find(group => group.name === 'Legs')
    const upperBody = data.filter(group => ['Chest', 'Back', 'Shoulders', 'Arms'].includes(group.name))
    const upperBodyTotal = upperBody.reduce((sum, group) => sum + group.percentage, 0)
    
    if (legsData && upperBodyTotal > legsData.percentage * 3) {
      recommendations.push("Don't skip leg day - increase lower body training")
    }

    if (recommendations.length === 0) {
      recommendations.push("Muscle groups are well balanced - maintain current routine")
    }

    return recommendations
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'balanced': return 'text-green-600 bg-green-50 border-green-200'
      case 'undertrained': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'overtrained': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'balanced': return <CheckCircle className="h-4 w-4" />
      case 'undertrained': return <TrendingUp className="h-4 w-4" />
      case 'overtrained': return <TrendingDown className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getRiskLevelColor = (level: string): string => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Muscle Balance Analysis
          </CardTitle>
          <CardDescription>Analyzing muscle group balance...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading balance analysis...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!balanceMetrics || muscleData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Muscle Balance Analysis
          </CardTitle>
          <CardDescription>Analyze muscle group balance and identify imbalances</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete some workouts to see your muscle balance analysis.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Muscle Balance Analysis
              </CardTitle>
              <CardDescription>Identify muscle imbalances and optimize your training</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Balance Score */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg text-center">
                  <Scale className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{balanceMetrics.overallBalance}%</div>
                  <div className="text-sm text-muted-foreground">Overall Balance</div>
                  <Progress value={balanceMetrics.overallBalance} className="mt-2" />
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{balanceMetrics.balancedCount}</div>
                  <div className="text-sm text-muted-foreground">Balanced Groups</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <AlertTriangle className={`h-6 w-6 mx-auto mb-2 ${getRiskLevelColor(balanceMetrics.riskLevel)}`} />
                  <div className="text-2xl font-bold">{balanceMetrics.imbalanceCount}</div>
                  <div className="text-sm text-muted-foreground">Imbalanced Groups</div>
                </div>
              </div>

              {/* Risk Level Alert */}
              {balanceMetrics.riskLevel !== 'low' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>
                      {balanceMetrics.riskLevel === 'high' ? 'High' : 'Medium'} Imbalance Risk:
                    </strong>{' '}
                    Multiple muscle groups show significant imbalances. Consider adjusting your training routine.
                  </AlertDescription>
                </Alert>
              )}

              {/* Muscle Group Distribution Chart */}
              <div className="space-y-3">
                <h4 className="font-medium">Muscle Group Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={muscleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Training Volume']}
                        labelFormatter={(label) => `Muscle Group: ${label}`}
                      />
                      <Bar 
                        dataKey="percentage" 
                        fill="#8884d8"
                        name="Current %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {/* Balance Radar Chart */}
              <div className="space-y-3">
                <h4 className="font-medium">Current vs Ideal Distribution</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={muscleTargets}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" fontSize={12} />
                      <PolarRadiusAxis angle={90} domain={[0, 25]} fontSize={10} />
                      <Radar 
                        name="Current %" 
                        dataKey="currentPercentage" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                      <Radar 
                        name="Target %" 
                        dataKey="targetPercentage" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.1}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Muscle Group Stats */}
              <div className="space-y-3">
                <h4 className="font-medium">Muscle Group Details</h4>
                {muscleData.map((group, index) => (
                  <div key={group.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <span className="font-medium">{group.name}</span>
                        <div className="text-sm text-muted-foreground">
                          {group.sessions} sessions • {group.totalVolume.toLocaleString()} volume
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right">
                        <div className="font-medium">{group.percentage}%</div>
                        <div className="text-muted-foreground">of total</div>
                      </div>
                      <div className="text-sm text-right">
                        <div className="font-medium">{group.lastTrained}</div>
                        <div className="text-muted-foreground">last trained</div>
                      </div>
                      <div className={`p-2 border rounded-lg ${getStatusColor(group.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(group.status)}
                          <span className="text-sm font-medium capitalize">{group.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Training Recommendations</h4>
                
                {balanceMetrics.recommendations.map((recommendation, index) => (
                  <Alert key={index}>
                    <Target className="h-4 w-4" />
                    <AlertDescription>{recommendation}</AlertDescription>
                  </Alert>
                ))}

                <div className="space-y-3">
                  <h5 className="font-medium">Specific Muscle Group Actions</h5>
                  {muscleData
                    .filter(group => group.status !== 'balanced')
                    .map(group => (
                      <div key={group.name} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{group.name}</span>
                          <Badge className={getStatusColor(group.status)}>
                            {group.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{group.recommendation}</p>
                      </div>
                    ))}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Balance Tips</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Aim for balanced push/pull exercises (chest/back ratio)</li>
                    <li>• Don't neglect smaller muscle groups like rear delts and calves</li>
                    <li>• Include compound movements that work multiple muscle groups</li>
                    <li>• Track volume over time rather than just individual sessions</li>
                    <li>• Consider deload weeks for overtrained muscle groups</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}