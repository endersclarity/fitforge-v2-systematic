/**
 * Unit tests for muscle-paths module
 * Tests utility functions, color mapping, and edge cases
 */

import {
  getMuscleColor,
  getUniqueMuscleNames,
  getMusclesByGroup,
  frontMusclePaths,
  backMusclePaths,
  bodyOutlineFront,
  bodyOutlineBack,
  MusclePath
} from '../muscle-paths'

describe('getMuscleColor', () => {
  it('should return green for low fatigue levels (0-20)', () => {
    expect(getMuscleColor(0)).toBe('#10B981')
    expect(getMuscleColor(10)).toBe('#10B981')
    expect(getMuscleColor(20)).toBe('#10B981')
  })

  it('should return yellow for light fatigue levels (21-40)', () => {
    expect(getMuscleColor(21)).toBe('#F59E0B')
    expect(getMuscleColor(30)).toBe('#F59E0B')
    expect(getMuscleColor(40)).toBe('#F59E0B')
  })

  it('should return orange for moderate fatigue levels (41-60)', () => {
    expect(getMuscleColor(41)).toBe('#FF8C42')
    expect(getMuscleColor(50)).toBe('#FF8C42')
    expect(getMuscleColor(60)).toBe('#FF8C42')
  })

  it('should return red for high fatigue levels (61-80)', () => {
    expect(getMuscleColor(61)).toBe('#FF6B6B')
    expect(getMuscleColor(70)).toBe('#FF6B6B')
    expect(getMuscleColor(80)).toBe('#FF6B6B')
  })

  it('should return dark red for severe fatigue levels (81-100)', () => {
    expect(getMuscleColor(81)).toBe('#FF375F')
    expect(getMuscleColor(90)).toBe('#FF375F')
    expect(getMuscleColor(100)).toBe('#FF375F')
  })

  it('should clamp negative values to 0', () => {
    expect(getMuscleColor(-10)).toBe('#10B981')
    expect(getMuscleColor(-100)).toBe('#10B981')
  })

  it('should clamp values above 100', () => {
    expect(getMuscleColor(110)).toBe('#FF375F')
    expect(getMuscleColor(200)).toBe('#FF375F')
  })

  it('should handle edge cases with invalid input', () => {
    expect(() => getMuscleColor(NaN)).toThrow('Fatigue level must be a valid number')
    expect(() => getMuscleColor(undefined as any)).toThrow('Fatigue level must be a valid number')
    expect(() => getMuscleColor(null as any)).toThrow('Fatigue level must be a valid number')
    expect(() => getMuscleColor('50' as any)).toThrow('Fatigue level must be a valid number')
  })

  it('should handle decimal values correctly', () => {
    expect(getMuscleColor(19.9)).toBe('#10B981')
    expect(getMuscleColor(20.1)).toBe('#F59E0B')
    expect(getMuscleColor(40.5)).toBe('#FF8C42')
  })
})

describe('getUniqueMuscleNames', () => {
  it('should return an array of unique muscle names', () => {
    const uniqueNames = getUniqueMuscleNames()
    expect(Array.isArray(uniqueNames)).toBe(true)
    expect(uniqueNames.length).toBeGreaterThan(0)
  })

  it('should return sorted names', () => {
    const uniqueNames = getUniqueMuscleNames()
    const sortedNames = [...uniqueNames].sort()
    expect(uniqueNames).toEqual(sortedNames)
  })

  it('should not contain duplicates', () => {
    const uniqueNames = getUniqueMuscleNames()
    const nameSet = new Set(uniqueNames)
    expect(uniqueNames.length).toBe(nameSet.size)
  })

  it('should include expected muscle names', () => {
    const uniqueNames = getUniqueMuscleNames()
    expect(uniqueNames).toContain('Pectoralis_Major')
    expect(uniqueNames).toContain('Latissimus_Dorsi')
    expect(uniqueNames).toContain('Quadriceps')
    expect(uniqueNames).toContain('Hamstrings')
  })

  it('should handle muscle names that appear in both front and back views', () => {
    const uniqueNames = getUniqueMuscleNames()
    const gastrocnemiusCount = uniqueNames.filter(name => name === 'Gastrocnemius').length
    expect(gastrocnemiusCount).toBe(1) // Should only appear once despite being in both views
  })
})

describe('getMusclesByGroup', () => {
  it('should return muscles for Push group', () => {
    const pushMuscles = getMusclesByGroup('Push')
    expect(Array.isArray(pushMuscles)).toBe(true)
    expect(pushMuscles.length).toBeGreaterThan(0)
    expect(pushMuscles.every(muscle => muscle.group === 'Push')).toBe(true)
  })

  it('should return muscles for Pull group', () => {
    const pullMuscles = getMusclesByGroup('Pull')
    expect(Array.isArray(pullMuscles)).toBe(true)
    expect(pullMuscles.length).toBeGreaterThan(0)
    expect(pullMuscles.every(muscle => muscle.group === 'Pull')).toBe(true)
  })

  it('should return muscles for Legs group', () => {
    const legMuscles = getMusclesByGroup('Legs')
    expect(Array.isArray(legMuscles)).toBe(true)
    expect(legMuscles.length).toBeGreaterThan(0)
    expect(legMuscles.every(muscle => muscle.group === 'Legs')).toBe(true)
  })

  it('should return muscles for Core group', () => {
    const coreMuscles = getMusclesByGroup('Core')
    expect(Array.isArray(coreMuscles)).toBe(true)
    expect(coreMuscles.length).toBeGreaterThan(0)
    expect(coreMuscles.every(muscle => muscle.group === 'Core')).toBe(true)
  })

  it('should throw error for invalid group', () => {
    expect(() => getMusclesByGroup('Invalid' as any)).toThrow('Group must be one of: Push, Pull, Legs, Core')
    expect(() => getMusclesByGroup('' as any)).toThrow('Group must be one of: Push, Pull, Legs, Core')
    expect(() => getMusclesByGroup(null as any)).toThrow('Group must be one of: Push, Pull, Legs, Core')
    expect(() => getMusclesByGroup(undefined as any)).toThrow('Group must be one of: Push, Pull, Legs, Core')
  })

  it('should include expected muscles in Push group', () => {
    const pushMuscles = getMusclesByGroup('Push')
    const muscleNames = pushMuscles.map(m => m.scientificName)
    expect(muscleNames).toContain('Pectoralis_Major')
    expect(muscleNames).toContain('Deltoid_Anterior')
    expect(muscleNames).toContain('Triceps_Brachii')
  })

  it('should include expected muscles in Pull group', () => {
    const pullMuscles = getMusclesByGroup('Pull')
    const muscleNames = pullMuscles.map(m => m.scientificName)
    expect(muscleNames).toContain('Latissimus_Dorsi')
    expect(muscleNames).toContain('Biceps_Brachii')
    expect(muscleNames).toContain('Rhomboids')
  })
})

describe('muscle data integrity', () => {
  it('should have front muscle paths with required properties', () => {
    expect(Array.isArray(frontMusclePaths)).toBe(true)
    expect(frontMusclePaths.length).toBeGreaterThan(0)
    
    frontMusclePaths.forEach((muscle, index) => {
      expect(muscle).toHaveProperty('scientificName')
      expect(muscle).toHaveProperty('name')
      expect(muscle).toHaveProperty('group')
      expect(muscle).toHaveProperty('path')
      expect(typeof muscle.scientificName).toBe('string')
      expect(typeof muscle.name).toBe('string')
      expect(['Push', 'Pull', 'Legs', 'Core']).toContain(muscle.group)
      expect(typeof muscle.path).toBe('string')
      expect(muscle.path.length).toBeGreaterThan(0)
    })
  })

  it('should have back muscle paths with required properties', () => {
    expect(Array.isArray(backMusclePaths)).toBe(true)
    expect(backMusclePaths.length).toBeGreaterThan(0)
    
    backMusclePaths.forEach((muscle, index) => {
      expect(muscle).toHaveProperty('scientificName')
      expect(muscle).toHaveProperty('name')
      expect(muscle).toHaveProperty('group')
      expect(muscle).toHaveProperty('path')
      expect(typeof muscle.scientificName).toBe('string')
      expect(typeof muscle.name).toBe('string')
      expect(['Push', 'Pull', 'Legs', 'Core']).toContain(muscle.group)
      expect(typeof muscle.path).toBe('string')
      expect(muscle.path.length).toBeGreaterThan(0)
    })
  })

  it('should have different body outlines for front and back', () => {
    expect(typeof bodyOutlineFront).toBe('string')
    expect(typeof bodyOutlineBack).toBe('string')
    expect(bodyOutlineFront.length).toBeGreaterThan(0)
    expect(bodyOutlineBack.length).toBeGreaterThan(0)
    expect(bodyOutlineFront).not.toBe(bodyOutlineBack)
  })

  it('should have valid SVG path format', () => {
    const svgPathRegex = /^[MLCZHVLmlczhvl0-9,\s\.-]+$/
    expect(svgPathRegex.test(bodyOutlineFront)).toBe(true)
    expect(svgPathRegex.test(bodyOutlineBack)).toBe(true)
    
    // Test a few muscle paths
    expect(svgPathRegex.test(frontMusclePaths[0].path)).toBe(true)
    expect(svgPathRegex.test(backMusclePaths[0].path)).toBe(true)
  })
})

describe('muscle groups distribution', () => {
  it('should have muscles in all four groups', () => {
    const allMuscles = [...frontMusclePaths, ...backMusclePaths]
    const groups = new Set(allMuscles.map(m => m.group))
    expect(groups.has('Push')).toBe(true)
    expect(groups.has('Pull')).toBe(true)
    expect(groups.has('Legs')).toBe(true)
    expect(groups.has('Core')).toBe(true)
  })

  it('should have reasonable distribution across groups', () => {
    const pushMuscles = getMusclesByGroup('Push')
    const pullMuscles = getMusclesByGroup('Pull')
    const legMuscles = getMusclesByGroup('Legs')
    const coreMuscles = getMusclesByGroup('Core')
    
    expect(pushMuscles.length).toBeGreaterThan(0)
    expect(pullMuscles.length).toBeGreaterThan(0)
    expect(legMuscles.length).toBeGreaterThan(0)
    expect(coreMuscles.length).toBeGreaterThan(0)
  })
})