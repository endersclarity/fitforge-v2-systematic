export interface FuzzyMatchOptions {
  threshold?: number // minimum score to consider a match (0-1)
}

// Levenshtein distance for basic fuzzy matching
export function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[a.length][b.length]
}

// Calculate similarity score between 0 and 1
export function fuzzyScore(term: string, text: string): number {
  const t = term.toLowerCase()
  const s = text.toLowerCase()
  const distance = levenshtein(t, s)
  const maxLen = Math.max(t.length, s.length)
  return 1 - distance / maxLen
}

export function fuzzyMatch(term: string, choices: string[], options: FuzzyMatchOptions = {}): { value: string; score: number }[] {
  if (!term) return choices.map(value => ({ value, score: 1 }))
  const results = choices.map(value => ({ value, score: fuzzyScore(term, value) }))
  const threshold = options.threshold ?? 0
  return results.filter(r => r.score >= threshold).sort((a, b) => b.score - a.score)
}
