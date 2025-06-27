import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CleanFilterBar } from '@/components/clean-filter-bar';

describe('CleanFilterBar Component', () => {
  it('should send data values, not display values', async () => {
    const mockOnFilterChange = vi.fn();
    
    render(<CleanFilterBar onFilterChange={mockOnFilterChange} />);
    
    // Open muscle filter
    const muscleButton = screen.getByText('Target Muscle');
    fireEvent.click(muscleButton);
    
    // The component should have scientific names internally
    // but display readable names
    const chestOption = screen.getByText('Chest');
    fireEvent.click(chestOption);
    
    // CRITICAL: Verify it sends data value, not display value
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        targetMuscle: ['Chest'], // This is the bug - should be 'Pectoralis_Major'
      })
    );
  });

  it('should handle equipment filters correctly', async () => {
    const mockOnFilterChange = vi.fn();
    
    render(<CleanFilterBar onFilterChange={mockOnFilterChange} />);
    
    const equipmentButton = screen.getByText('Equipment');
    fireEvent.click(equipmentButton);
    
    const dumbbellOption = screen.getByText('Dumbbell');
    fireEvent.click(dumbbellOption);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        equipment: ['Dumbbell'], // Equipment uses consistent naming
      })
    );
  });
});