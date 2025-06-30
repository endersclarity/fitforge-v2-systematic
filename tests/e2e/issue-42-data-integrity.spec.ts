import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Data Integrity Tests', () => {
  // Load exercise data once for all tests
  const exerciseDataPath = path.join(process.cwd(), 'data', 'exercises-real.json');
  let exerciseData: any[];

  test.beforeAll(() => {
    const rawData = fs.readFileSync(exerciseDataPath, 'utf-8');
    exerciseData = JSON.parse(rawData);
  });

  test('should have exactly 38 exercises', async () => {
    expect(exerciseData).toHaveLength(38);
  });

  test('all exercises should have required fields', async () => {
    const requiredFields = ['name', 'equipment', 'category', 'muscleEngagement'];
    const missingFields: string[] = [];

    exerciseData.forEach((exercise, index) => {
      requiredFields.forEach(field => {
        if (!exercise[field]) {
          missingFields.push(`Exercise ${index} (${exercise.name || 'unnamed'}) missing field: ${field}`);
        }
      });
    });

    expect(missingFields).toHaveLength(0);
  });

  test('🚨 CRITICAL: muscle engagement totals should equal 100%', async () => {
    const invalidExercises: string[] = [];
    const tolerance = 0.01; // Allow 0.01% tolerance for floating point

    exerciseData.forEach((exercise, index) => {
      // Sum all muscle engagement percentages from muscleEngagement object
      let total = 0;
      const muscleEngagement = exercise.muscleEngagement || {};
      const muscles = Object.keys(muscleEngagement);

      muscles.forEach(muscle => {
        const value = parseFloat(muscleEngagement[muscle]);
        if (!isNaN(value)) {
          total += value;
        }
      });

      // Check if total is approximately 100
      if (Math.abs(total - 100) > tolerance) {
        invalidExercises.push(
          `${exercise.name}: ${total.toFixed(2)}% (muscles: ${muscles.length})`
        );
      }
    });

    // This test is expected to FAIL based on container test findings
    console.log(`Found ${invalidExercises.length} exercises with invalid muscle totals`);
    if (invalidExercises.length > 0) {
      console.log('Invalid exercises:', invalidExercises.slice(0, 5).join('\n'));
    }

    expect(invalidExercises).toHaveLength(0);
  });

  test('all equipment types should match defined constants', async () => {
    const validEquipment = [
      'Bodyweight', 
      'Dumbbell', 
      'Barbell', 
      'Cable', 
      'Machine',
      'Resistance Band',
      'Kettlebell',
      'Bench',
      'Pull-up_Bar',
      'TRX',
      'Plybox'
    ];

    const invalidEquipment: string[] = [];

    exerciseData.forEach(exercise => {
      if (!validEquipment.includes(exercise.equipment)) {
        invalidEquipment.push(`${exercise.name}: invalid equipment "${exercise.equipment}"`);
      }
    });

    expect(invalidEquipment).toHaveLength(0);
  });

  test('all categories should be valid', async () => {
    const validCategories = ['Push', 'Pull', 'Legs', 'Core', 'BackBiceps', 'ChestTriceps', 'Shoulders', 'LegsGlutes', 'Abs'];
    const invalidCategories: string[] = [];

    exerciseData.forEach(exercise => {
      if (!validCategories.includes(exercise.category)) {
        invalidCategories.push(`${exercise.name}: invalid category "${exercise.category}"`);
      }
    });

    expect(invalidCategories).toHaveLength(0);
  });

  test('exercise names should be unique', async () => {
    const names = exerciseData.map(ex => ex.name);
    const uniqueNames = [...new Set(names)];

    expect(names).toHaveLength(uniqueNames.length);
  });

  test('muscle engagement values should be between 0 and 100', async () => {
    const invalidValues: string[] = [];

    exerciseData.forEach(exercise => {
      const muscleEngagement = exercise.muscleEngagement || {};
      
      Object.entries(muscleEngagement).forEach(([muscle, value]) => {
        const numValue = parseFloat(value as string);
        if (!isNaN(numValue) && (numValue < 0 || numValue > 100)) {
          invalidValues.push(`${exercise.name}.${muscle}: ${numValue}%`);
        }
      });
    });

    expect(invalidValues).toHaveLength(0);
  });
});