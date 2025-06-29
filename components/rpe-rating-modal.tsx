'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Target } from "lucide-react"

interface RPERatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rpe: number) => void
  setDetails: {
    weight: number
    reps: number
    exercise: string
  }
}

const RPE_DESCRIPTIONS = {
  1: { label: 'Very Light', description: 'No effort, could do many more reps' },
  2: { label: 'Light', description: 'Very easy, could do many more reps' },
  3: { label: 'Moderate', description: 'Easy, could do several more reps' },
  4: { label: 'Somewhat Hard', description: 'Could do 3-5 more reps' },
  5: { label: 'Hard', description: 'Could do 2-3 more reps' },
  6: { label: 'Hard+', description: 'Could do 1-2 more reps' },
  7: { label: 'Very Hard', description: 'Could do 1 more rep' },
  8: { label: 'Very Hard+', description: 'Could maybe do 1 more rep' },
  9: { label: 'Near Max', description: 'Could not do another rep' },
  10: { label: 'Max Effort', description: 'Could not do another rep, maximal effort' }
}

export function RPERatingModal({ isOpen, onClose, onSubmit, setDetails }: RPERatingModalProps) {
  const [selectedRPE, setSelectedRPE] = useState<number | null>(null)

  if (!isOpen) return null

  const handleSubmit = () => {
    if (selectedRPE !== null) {
      onSubmit(selectedRPE)
      setSelectedRPE(null)
    }
  }

  const getRPEColor = (rpe: number) => {
    if (rpe <= 3) return 'bg-green-500 hover:bg-green-600 border-green-600'
    if (rpe <= 6) return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600'
    if (rpe <= 8) return 'bg-orange-500 hover:bg-orange-600 border-orange-600'
    return 'bg-red-500 hover:bg-red-600 border-red-600'
  }

  const getSelectedColor = (rpe: number) => {
    if (rpe <= 3) return 'ring-green-500 bg-green-500/20'
    if (rpe <= 6) return 'ring-yellow-500 bg-yellow-500/20'
    if (rpe <= 8) return 'ring-orange-500 bg-orange-500/20'
    return 'ring-red-500 bg-red-500/20'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#1C1C1E] border-[#2C2C2E] w-full max-w-md" data-testid="rpe-modal">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-[#FF375F]" />
              <CardTitle className="text-lg text-white">Rate Your Exertion</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-[#A1A1A3]">
            How difficult was {setDetails.reps} reps × {setDetails.weight} lbs?
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* RPE Scale */}
          <div className="space-y-3" data-testid="rpe-scale">
            <h3 className="text-sm font-medium text-[#A1A1A3] mb-3">Rate of Perceived Exertion (RPE)</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(RPE_DESCRIPTIONS).map(([rpe, { label, description }]) => {
                const rpeNum = parseInt(rpe)
                const isSelected = selectedRPE === rpeNum
                
                return (
                  <button
                    key={rpe}
                    onClick={() => setSelectedRPE(rpeNum)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected 
                        ? `ring-2 ${getSelectedColor(rpeNum)} border-white` 
                        : 'border-[#3C3C3E] hover:border-[#4C4C4E] bg-[#2C2C2E] hover:bg-[#3C3C3E]'
                    }`}
                    data-testid={`rpe-rating-${rpe}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold">{rpe}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRPEColor(rpeNum)}`}
                      >
                        {label}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#A1A1A3] leading-tight">
                      {description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected RPE Display */}
          {selectedRPE && (
            <div className="p-4 bg-[#2C2C2E] rounded-lg border border-[#3C3C3E]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    RPE {selectedRPE}: {RPE_DESCRIPTIONS[selectedRPE as keyof typeof RPE_DESCRIPTIONS].label}
                  </p>
                  <p className="text-sm text-[#A1A1A3]">
                    {RPE_DESCRIPTIONS[selectedRPE as keyof typeof RPE_DESCRIPTIONS].description}
                  </p>
                </div>
                <Badge className={`${getRPEColor(selectedRPE)} text-white`}>
                  Selected
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-[#2C2C2E] border-[#3C3C3E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedRPE === null}
              className="flex-1 bg-[#FF375F] hover:bg-[#E63050] text-white disabled:bg-[#3C3C3E] disabled:text-[#A1A1A3]"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}