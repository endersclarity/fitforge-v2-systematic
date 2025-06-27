import { describe, it, expect } from 'vitest';

// This will be imported from the actual implementation
const MUSCLE_DATA_NAMES = {
  PECTORALIS_MAJOR: 'Pectoralis_Major',
  TRICEPS_BRACHII: 'Triceps_Brachii',
  BICEPS_BRACHII: 'Biceps_Brachii',
  // Add more as needed
} as const;

const MUSCLE_DISPLAY_MAP: Record<string, string> = {
  'Pectoralis_Major': 'Chest',
  'Triceps_Brachii': 'Triceps',
  'Biceps_Brachii': 'Biceps',
  // Add more as needed
};

const DISPLAY_TO_DATA_MAP: Record<string, string> = {
  'Chest': 'Pectoralis_Major',
  'Triceps': 'Triceps_Brachii',
  'Biceps': 'Biceps_Brachii',
  // Add more as needed
};

describe('Muscle Name Mapping', () => {
  it('should have consistent bidirectional mapping', () => {
    // Every display name should map back to its data name
    Object.entries(MUSCLE_DISPLAY_MAP).forEach(([dataName, displayName]) => {
      expect(DISPLAY_TO_DATA_MAP[displayName]).toBe(dataName);
    });
    
    // Every reverse mapping should map back to display name
    Object.entries(DISPLAY_TO_DATA_MAP).forEach(([displayName, dataName]) => {
      expect(MUSCLE_DISPLAY_MAP[dataName]).toBe(displayName);
    });
  });
  
  it('should map common muscle names correctly', () => {
    expect(MUSCLE_DISPLAY_MAP['Pectoralis_Major']).toBe('Chest');
    expect(DISPLAY_TO_DATA_MAP['Chest']).toBe('Pectoralis_Major');
    
    expect(MUSCLE_DISPLAY_MAP['Triceps_Brachii']).toBe('Triceps');
    expect(DISPLAY_TO_DATA_MAP['Triceps']).toBe('Triceps_Brachii');
  });
  
  it('should handle all muscle names from exercise data', () => {
    // These are the actual muscle names from the data
    const musclesFromData = [
      'Pectoralis_Major', 'Triceps_Brachii', 'Biceps_Brachii',
      'Deltoids', 'Latissimus_Dorsi', 'Quadriceps', 'Hamstrings',
      'Gluteus_Maximus', 'Gastrocnemius', 'Core', 'Trapezius'
    ];
    
    musclesFromData.forEach(muscle => {
      // Every muscle from data should have a display name
      expect(MUSCLE_DISPLAY_MAP[muscle]).toBeDefined();
      
      // And that display name should map back
      const displayName = MUSCLE_DISPLAY_MAP[muscle];
      expect(DISPLAY_TO_DATA_MAP[displayName]).toBe(muscle);
    });
  });
});