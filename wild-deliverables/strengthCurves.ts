export type StrengthCurve = number[]

export const defaultCurves: Record<string, StrengthCurve> = {
  benchPress: [1, 0.95, 0.9, 0.85, 0.9, 0.95, 1],
  squat: [1, 0.98, 0.95, 0.9, 0.95, 1],
  deadlift: [1, 0.97, 0.94, 0.9, 0.95, 0.97, 1],
}

export function strengthMultiplier(
  exercise: string,
  position: number,
  curves: Record<string, StrengthCurve> = defaultCurves
): number {
  const curve = curves[exercise]
  if (!curve) return 1
  const index = Math.min(
    curve.length - 1,
    Math.max(0, Math.round(position * (curve.length - 1)))
  )
  return curve[index]
}
