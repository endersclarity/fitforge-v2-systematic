/**
 * Returns a heat map color for a given percentage.
 * 0% -> cool blue, 100% -> hot red.
 */
export function getHeatColor(percent: number): string {
  const clamped = Math.min(100, Math.max(0, percent))
  const hue = (1 - clamped / 100) * 240 // 240 = blue, 0 = red
  return `hsl(${hue}, 100%, 50%)`
}

/** Small helper to map engagement object to muscle colors */
export function mapEngagementToColors(engagement: Record<string, number>): Record<string, string> {
  const result: Record<string, string> = {}
  Object.entries(engagement).forEach(([muscle, value]) => {
    result[muscle] = getHeatColor(value)
  })
  return result
}
