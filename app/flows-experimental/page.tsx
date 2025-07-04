'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Dumbbell, Calendar, Heart, BarChart, BookOpen, Navigation, TrendingUp, Users } from 'lucide-react'

export default function ExperimentalFlowsLanding() {
  const router = useRouter()

  const experimentalFlows = [
    // Completed Features
    {
      id: 'exercise-browser',
      title: 'Exercise Browser',
      description: 'Browse and filter exercises with Fitbod-style UX patterns',
      icon: Dumbbell,
      route: '/flows-experimental/exercise-browser',
      status: 'active',
      issueNumber: 25
    },
    {
      id: 'workout-builder',
      title: 'Workout Builder',
      description: 'Drag-and-drop workout creation with exercise grouping',
      icon: Calendar,
      route: '/flows-experimental/workout-builder',
      status: 'active',
      issueNumber: 26
    },
    {
      id: 'workout-execution',
      title: 'Workout Execution',
      description: 'Advanced set logging with RPE ratings, batch actions, and muscle fatigue visualization',
      icon: BarChart,
      route: '/flows-experimental/workout-execution',
      status: 'active',
      issueNumber: 27
    },
    {
      id: 'recovery-dashboard',
      title: 'Recovery Dashboard',
      description: 'Visual muscle recovery tracking and fatigue management',
      icon: Heart,
      route: '/flows-experimental/recovery',
      status: 'active',
      issueNumber: 28
    },
    {
      id: 'saved-workouts',
      title: 'Saved Workouts',
      description: 'Manage, organize, and execute saved workout templates',
      icon: BookOpen,
      route: '/flows-experimental/saved-workouts',
      status: 'active',
      issueNumber: 34
    },
    // Planned Features (Placeholders)
    {
      id: 'flow-navigation',
      title: 'Flow Navigation Hub',
      description: 'Unified navigation system for all experimental flows',
      icon: Navigation,
      route: '/flows-experimental/navigation-hub',
      status: 'coming-soon',
      issueNumber: 29
    },
    {
      id: 'progress-tracking',
      title: 'Progress Tracking',
      description: 'Visual progress charts and personal records tracking',
      icon: TrendingUp,
      route: '/flows-experimental/progress-tracking',
      status: 'coming-soon'
    },
    {
      id: 'social-features',
      title: 'Social & Sharing',
      description: 'Share workouts and compete with friends',
      icon: Users,
      route: '/flows-experimental/social',
      status: 'coming-soon'
    }
  ]

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="bg-fitbod-card border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-fitbod-text">Experimental Flows</h1>
            <p className="text-fitbod-text-secondary">
              Testing flow-based architecture with proven UX patterns
            </p>
          </div>
        </div>

        {/* Explanation Card */}
        <Card className="bg-fitbod-card border-fitbod-subtle mb-6">
          <CardHeader>
            <CardTitle className="text-fitbod-text">About Experimental Flows</CardTitle>
          </CardHeader>
          <CardContent className="text-fitbod-text-secondary">
            <p className="mb-3">
              These experimental pages follow proven Fitbod UX patterns to create cohesive user experiences.
              Instead of building features in isolation, each flow represents a complete user journey.
            </p>
            <p>
              <strong className="text-fitbod-text">Goal:</strong> Test flow-based architecture that connects
              our robust backend with intuitive user interfaces. Successful patterns will be integrated
              into the main app.
            </p>
          </CardContent>
        </Card>

        {/* Flow Cards */}
        <div className="space-y-4">
          {experimentalFlows.map((flow) => {
            const Icon = flow.icon
            const isActive = flow.status === 'active'
            
            return (
              <Card 
                key={flow.id}
                className={`bg-fitbod-card border-fitbod-subtle transition-all ${
                  isActive ? 'hover:bg-fitbod-subtle cursor-pointer' : 'opacity-60'
                }`}
                onClick={() => isActive && router.push(flow.route)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-fitbod-subtle rounded-lg">
                        <Icon className="h-5 w-5 text-fitbod-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-fitbod-text">{flow.title}</CardTitle>
                        <CardDescription className="text-fitbod-text-secondary">
                          {flow.description}
                        </CardDescription>
                      </div>
                    </div>
                    {flow.status === 'coming-soon' && (
                      <span className="text-xs bg-fitbod-subtle text-fitbod-text-secondary px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                    {flow.status === 'active' && (
                      <span className="text-xs bg-fitbod-accent/20 text-fitbod-accent px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-fitbod-text-secondary">
          <p>These experimental features are in active development.</p>
          <p>Your feedback helps shape the future of FitForge.</p>
        </div>
      </div>
    </div>
  )
}