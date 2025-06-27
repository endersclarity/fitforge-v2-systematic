/**
 * Single source of truth for muscle name mapping
 * Resolves the data contract mismatch between components
 */

// Data values as they appear in exercises-real.json
export const MUSCLE_DATA_NAMES = {
  PECTORALIS_MAJOR: 'Pectoralis_Major',
  TRICEPS_BRACHII: 'Triceps_Brachii',
  BICEPS_BRACHII: 'Biceps_Brachii',
  DELTOIDS: 'Deltoids',
  ANTERIOR_DELTOIDS: 'Anterior_Deltoids',
  REAR_DELTOIDS: 'Rear_Deltoids',
  LATISSIMUS_DORSI: 'Latissimus_Dorsi',
  QUADRICEPS: 'Quadriceps',
  HAMSTRINGS: 'Hamstrings',
  GASTROCNEMIUS: 'Gastrocnemius',
  GLUTEUS_MAXIMUS: 'Gluteus_Maximus',
  GLUTES: 'Glutes',
  ERECTOR_SPINAE: 'Erector_Spinae',
  RECTUS_ABDOMINIS: 'Rectus_Abdominis',
  CORE: 'Core',
  CORE_STABILIZERS: 'Core_Stabilizers',
  OBLIQUES: 'Obliques',
  TRAPEZIUS: 'Trapezius',
  RHOMBOIDS: 'Rhomboids',
  SHOULDERS: 'Shoulders',
  GRIP_FOREARMS: 'Grip_Forearms',
  BRACHIALIS: 'Brachialis',
  BRACHIORADIALIS: 'Brachioradialis',
  ANCONEUS: 'Anconeus',
  LEVATOR_SCAPULAE: 'Levator_Scapulae',
  ROTATOR_CUFF: 'Rotator_Cuff',
  SERRATUS_ANTERIOR: 'Serratus_Anterior',
  SOLEUS: 'Soleus',
  HIP_FLEXORS: 'Hip_Flexors',
  TRANSVERSE_ABDOMINIS: 'Transverse_Abdominis',
} as const;

// Map data names to display names
export const MUSCLE_DISPLAY_MAP: Record<string, string> = {
  'Pectoralis_Major': 'Chest',
  'Triceps_Brachii': 'Triceps',
  'Biceps_Brachii': 'Biceps',
  'Deltoids': 'Shoulders',
  'Anterior_Deltoids': 'Front Shoulders',
  'Rear_Deltoids': 'Rear Shoulders',
  'Latissimus_Dorsi': 'Lats',
  'Quadriceps': 'Quads',
  'Hamstrings': 'Hamstrings',
  'Gastrocnemius': 'Calves',
  'Gluteus_Maximus': 'Glutes',
  'Glutes': 'Glutes',
  'Erector_Spinae': 'Lower Back',
  'Rectus_Abdominis': 'Abs',
  'Core': 'Core',
  'Core_Stabilizers': 'Core',
  'Obliques': 'Obliques',
  'Trapezius': 'Traps',
  'Rhomboids': 'Rhomboids',
  'Shoulders': 'Shoulders',
  'Grip_Forearms': 'Forearms',
  'Brachialis': 'Brachialis',
  'Brachioradialis': 'Brachioradialis', 
  'Anconeus': 'Anconeus',
  'Levator_Scapulae': 'Neck',
  'Rotator_Cuff': 'Rotator Cuff',
  'Serratus_Anterior': 'Serratus',
  'Soleus': 'Calves',
  'Hip_Flexors': 'Hip Flexors',
  'Transverse_Abdominis': 'Deep Core',
};

// Reverse map for converting display names back to data names
export const DISPLAY_TO_DATA_MAP: Record<string, string> = Object.entries(MUSCLE_DISPLAY_MAP)
  .reduce((acc, [dataName, displayName]) => {
    // Handle cases where multiple data names map to same display name
    if (!acc[displayName]) {
      acc[displayName] = dataName;
    }
    return acc;
  }, {} as Record<string, string>);

// Helper function to get all unique muscle groups for display
export function getUniqueMuscleGroups(): string[] {
  return Array.from(new Set(Object.values(MUSCLE_DISPLAY_MAP))).sort();
}

// Helper to convert display name to data name
export function displayToDataName(displayName: string): string {
  return DISPLAY_TO_DATA_MAP[displayName] || displayName;
}

// Helper to convert data name to display name
export function dataToDisplayName(dataName: string): string {
  return MUSCLE_DISPLAY_MAP[dataName] || dataName;
}