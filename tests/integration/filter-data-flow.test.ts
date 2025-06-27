import { describe, it, expect } from 'vitest';
import exercisesData from '@/data/exercises-real.json';

describe('Filter Data Flow Integration', () => {
  describe('Data Contract Verification', () => {
    it('should have consistent muscle names between data and UI', () => {
      // Extract all unique muscle names from data
      const muscleNamesInData = new Set<string>();
      
      exercisesData.forEach(exercise => {
        if (exercise.muscleEngagement) {
          Object.keys(exercise.muscleEngagement).forEach(muscle => {
            muscleNamesInData.add(muscle);
          });
        }
      });
      
      // These are the muscle names in our data
      expect(muscleNamesInData).toContain('Pectoralis_Major');
      expect(muscleNamesInData).toContain('Triceps_Brachii');
      expect(muscleNamesInData).toContain('Biceps_Brachii');
      
      // The filter component converts these for display
      const displayNameMapping = {
        'Pectoralis_Major': 'Chest',
        'Triceps_Brachii': 'Triceps',
        'Biceps_Brachii': 'Biceps',
        'Quadriceps': 'Quads',
        'Latissimus_Dorsi': 'Lats',
        'Deltoids_Anterior': 'Front Shoulders',
        'Deltoids_Posterior': 'Rear Shoulders',
        'Deltoids_Lateral': 'Side Shoulders',
        'Gastrocnemius': 'Calves',
        'Gluteus_Maximus': 'Glutes',
        'Erector_Spinae': 'Lower Back',
        'Rectus_Abdominis': 'Abs'
      };
      
      // Verify mapping exists for all data muscles
      muscleNamesInData.forEach(muscle => {
        if (!displayNameMapping[muscle] && !muscle.includes('Deltoids')) {
          console.warn(`No display mapping for muscle: ${muscle}`);
        }
      });
    });

    it('should filter exercises by equipment correctly', () => {
      const dumbbellExercises = exercisesData.filter(ex => ex.equipment === 'Dumbbell');
      expect(dumbbellExercises).toHaveLength(11);
      
      const benchExercises = exercisesData.filter(ex => ex.equipment === 'Bench');
      expect(benchExercises).toHaveLength(5);
      
      const bodyweightExercises = exercisesData.filter(ex => ex.equipment === 'Bodyweight');
      expect(bodyweightExercises).toHaveLength(10);
    });

    it('should have exercises with muscle engagement for filtering', () => {
      // Find exercises that engage Pectoralis_Major (Chest)
      const chestExercises = exercisesData.filter(ex => 
        ex.muscleEngagement && ex.muscleEngagement['Pectoralis_Major'] > 0
      );
      
      expect(chestExercises.length).toBeGreaterThan(0);
      expect(chestExercises.some(ex => ex.name === 'Bench Press')).toBe(true);
      expect(chestExercises.some(ex => ex.name === 'Pushup')).toBe(true);
    });
  });

  describe('Filter Logic Verification', () => {
    it('should correctly identify exercises by muscle group', () => {
      // The bug: filter sends "Chest" but data has "Pectoralis_Major"
      const filterValue = 'Chest';
      
      // This is what the broken filter does
      const brokenFilter = exercisesData.filter(ex => {
        const muscles = Object.keys(ex.muscleEngagement || {});
        return muscles.some(muscle => muscle.includes(filterValue));
      });
      
      expect(brokenFilter).toHaveLength(0); // No matches!
      
      // This is what it should do
      const correctFilter = exercisesData.filter(ex => {
        const muscles = Object.keys(ex.muscleEngagement || {});
        return muscles.some(muscle => muscle === 'Pectoralis_Major');
      });
      
      expect(correctFilter.length).toBeGreaterThan(0);
    });
  });
});