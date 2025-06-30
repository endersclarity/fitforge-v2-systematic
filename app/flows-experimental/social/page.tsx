'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users, Construction } from 'lucide-react'

export default function SocialFeaturesPage() {
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
            <h1 className="text-2xl font-bold text-fitbod-text">Social & Sharing</h1>
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
              This feature is currently being developed. Social features will allow you to share
              workouts, compete with friends, and build a fitness community.
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
              <Users className="h-4 w-4 text-fitbod-accent" />
              <span>Share workout templates with friends</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-fitbod-accent" />
              <span>Join or create workout challenges</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-fitbod-accent" />
              <span>Follow friends and see their progress</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-fitbod-accent" />
              <span>Leaderboards and achievements</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}