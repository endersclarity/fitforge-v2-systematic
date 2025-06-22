import exercisesData from '../data/exercises-real.json'
import { applyFilters, Exercise, FilterOptions } from './searchFilters'
import { fuzzyMatch } from './fuzzyMatching'

export interface SearchResult {
  exercise: Exercise
  score: number
}

const HISTORY_KEY = 'exercise_search_history'

function loadHistory(): string[] {
  if (typeof localStorage === 'undefined') return []
  const raw = localStorage.getItem(HISTORY_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveHistory(history: string[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)))
}

export function addSearchTerm(term: string) {
  const history = loadHistory()
  if (!term || history[0] === term) return
  const newHistory = [term, ...history.filter(t => t !== term)]
  saveHistory(newHistory)
}

export function getSearchHistory(): string[] {
  return loadHistory()
}

export function searchExercises(term: string, filters: FilterOptions = {}): SearchResult[] {
  const exercises = applyFilters(exercisesData as Exercise[], filters)
  const matches = fuzzyMatch(term, exercises.map(e => e.name), { threshold: 0 })
  const results = matches.map(match => {
    const exercise = exercises.find(e => e.name === match.value) as Exercise
    return { exercise, score: match.score }
  })
  return results.sort((a, b) => b.score - a.score)
}
