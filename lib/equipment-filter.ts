/**
 * Equipment Filtering Utilities
 * 
 * Provides functions for filtering exercises based on available equipment.
 * Used for implementing "Your available equipment" toggle functionality.
 */

import { Exercise, EquipmentType, EQUIPMENT_TYPES, isValidEquipmentType } from '@/schemas/typescript-interfaces';

// ============================================================================
// EQUIPMENT FILTERING FUNCTIONS
// ============================================================================

/**
 * Filter exercises by available equipment types
 * @param exercises - Array of exercises to filter
 * @param availableEquipment - Array of equipment types that are available
 * @returns Filtered array of exercises that can be performed with available equipment
 */
export function filterExercisesByEquipment(
  exercises: Exercise[],
  availableEquipment: EquipmentType[]
): Exercise[] {
  if (availableEquipment.length === 0) {
    return exercises; // No filter applied, return all exercises
  }
  
  return exercises.filter(exercise => 
    availableEquipment.includes(exercise.equipment)
  );
}

/**
 * Get unique equipment types from exercise array
 * @param exercises - Array of exercises
 * @returns Array of unique equipment types found in exercises
 */
export function getUniqueEquipmentTypes(exercises: Exercise[]): EquipmentType[] {
  const equipmentSet = new Set<EquipmentType>();
  
  exercises.forEach(exercise => {
    if (isValidEquipmentType(exercise.equipment)) {
      equipmentSet.add(exercise.equipment);
    }
  });
  
  return Array.from(equipmentSet).sort();
}

/**
 * Count exercises by equipment type
 * @param exercises - Array of exercises
 * @returns Object with equipment type as key and count as value
 */
export function countExercisesByEquipment(exercises: Exercise[]): Record<EquipmentType, number> {
  const counts = {} as Record<EquipmentType, number>;
  
  // Initialize all equipment types with 0
  Object.values(EQUIPMENT_TYPES).forEach(equipment => {
    counts[equipment] = 0;
  });
  
  // Count exercises for each equipment type
  exercises.forEach(exercise => {
    if (isValidEquipmentType(exercise.equipment)) {
      counts[exercise.equipment]++;
    }
  });
  
  return counts;
}

/**
 * Get equipment types sorted by exercise count (most common first)
 * @param exercises - Array of exercises
 * @returns Array of equipment types sorted by frequency
 */
export function getEquipmentTypesByPopularity(exercises: Exercise[]): EquipmentType[] {
  const counts = countExercisesByEquipment(exercises);
  
  return Object.keys(counts)
    .filter(equipment => counts[equipment as EquipmentType] > 0)
    .sort((a, b) => counts[b as EquipmentType] - counts[a as EquipmentType]) as EquipmentType[];
}

// ============================================================================
// EQUIPMENT PRESET FUNCTIONS
// ============================================================================

/**
 * Common equipment presets for different workout setups
 */
export const EQUIPMENT_PRESETS = {
  HOME_BASIC: [EQUIPMENT_TYPES.BODYWEIGHT, EQUIPMENT_TYPES.DUMBBELL],
  HOME_INTERMEDIATE: [EQUIPMENT_TYPES.BODYWEIGHT, EQUIPMENT_TYPES.DUMBBELL, EQUIPMENT_TYPES.PULL_UP_BAR],
  HOME_ADVANCED: [EQUIPMENT_TYPES.BODYWEIGHT, EQUIPMENT_TYPES.DUMBBELL, EQUIPMENT_TYPES.PULL_UP_BAR, EQUIPMENT_TYPES.TRX],
  GYM_BASIC: [EQUIPMENT_TYPES.BODYWEIGHT, EQUIPMENT_TYPES.DUMBBELL, EQUIPMENT_TYPES.BENCH],
  GYM_FULL: Object.values(EQUIPMENT_TYPES) as EquipmentType[],
  BODYWEIGHT_ONLY: [EQUIPMENT_TYPES.BODYWEIGHT]
} as const;

/**
 * Get equipment preset by name
 * @param presetName - Name of the equipment preset
 * @returns Array of equipment types for the preset
 */
export function getEquipmentPreset(presetName: keyof typeof EQUIPMENT_PRESETS): EquipmentType[] {
  return EQUIPMENT_PRESETS[presetName];
}

// ============================================================================
// STORAGE UTILITIES FOR USER PREFERENCES
// ============================================================================

const STORAGE_KEY = 'fitforge_available_equipment';

/**
 * Save user's available equipment to localStorage
 * @param equipment - Array of equipment types available to user
 */
export function saveAvailableEquipment(equipment: EquipmentType[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
  } catch (error) {
    console.warn('Failed to save equipment preferences:', error);
  }
}

/**
 * Load user's available equipment from localStorage
 * @returns Array of equipment types, or empty array if none saved
 */
export function loadAvailableEquipment(): EquipmentType[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    // Validate each equipment type
    return parsed.filter(isValidEquipmentType);
  } catch (error) {
    console.warn('Failed to load equipment preferences:', error);
    return [];
  }
}

/**
 * Clear saved equipment preferences
 */
export function clearAvailableEquipment(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear equipment preferences:', error);
  }
}