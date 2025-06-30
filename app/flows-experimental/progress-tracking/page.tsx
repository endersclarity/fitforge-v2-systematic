'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Construction } from 'lucide-react'

export default function ProgressTrackingPage() {
  const router = useRouter()

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
            <h1 className="text-2xl font-bold text-fitbod-text">Progress Tracking</h1>
            <p className="text-fitbod-text-secondary">
              Coming Soon
            </p>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="bg-fitbod-card border-fitbod-subtle">
          <CardHeader className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-fitbod-subtle rounded-full">
                <Construction className="h-12 w-12 text-fitbod-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl text-fitbod-text mb-2">Under Construction</CardTitle>
            <CardDescription className="text-fitbod-text-secondary max-w-md mx-auto">
              This feature is currently being developed. Progress Tracking will provide comprehensive
              visualizations of your fitness journey, personal records, and workout trends.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Button
              onClick={() => router.push('/flows-experimental')}
              className="bg-fitbod-accent text-white hover:bg-fitbod-accent/90"
            >
              Back to Experimental Flows
            </Button>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-fitbod-text">Planned Features:</h3>
          <ul className="space-y-2 text-fitbod-text-secondary">
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-fitbod-accent" />
              <span>Visual progress charts for strength gains</span>
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-fitbod-accent" />
              <span>Personal record tracking and celebrations</span>
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-fitbod-accent" />
              <span>Volume and intensity progression analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-fitbod-accent" />
              <span>Muscle group development balance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}