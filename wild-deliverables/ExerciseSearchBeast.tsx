"use client"

import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import type { Exercise, FilterOptions } from "./searchFilters"
import { searchExercises, addSearchTerm, getSearchHistory } from "./searchEngine"

interface Props {
  onSelect?: (exercise: Exercise) => void
}

export function ExerciseSearchBeast({ onSelect }: Props) {
  const [term, setTerm] = useState("")
  const [results, setResults] = useState<Exercise[]>([])
  const [filters] = useState<FilterOptions>({})
  const [history, setHistory] = useState<string[]>([])
  const [highlightIndex, setHighlightIndex] = useState(0)

  const runSearch = useCallback(
    (query: string) => {
      const matches = searchExercises(query, filters)
      setResults(matches.map(m => m.exercise))
    },
    [filters]
  )

  useEffect(() => {
    runSearch(term)
  }, [term, runSearch])

  useEffect(() => {
    setHistory(getSearchHistory())
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && results[highlightIndex]) {
      onSelect?.(results[highlightIndex])
      addSearchTerm(results[highlightIndex].name)
      setHistory(getSearchHistory())
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          value={term}
          onChange={e => setTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search exercises..."
          className="pl-8"
        />
      </div>
      {history.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {history.map(h => (
            <Badge key={h} onClick={() => setTerm(h)} className="cursor-pointer">
              {h}
            </Badge>
          ))}
        </div>
      )}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {results.map((ex, idx) => (
          <Card
            key={ex.id}
            className={
              "cursor-pointer" + (idx === highlightIndex ? " bg-muted" : "")
            }
            onMouseEnter={() => setHighlightIndex(idx)}
            onClick={() => {
              onSelect?.(ex)
              addSearchTerm(ex.name)
              setHistory(getSearchHistory())
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm">{ex.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {ex.category} - {ex.equipment} - {ex.difficulty}
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && (
          <p className="text-sm text-muted-foreground">No exercises found.</p>
        )}
      </div>
    </div>
  )
}
