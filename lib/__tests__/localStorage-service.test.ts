import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageService } from '../localStorage-service'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Mock Blob
global.Blob = class Blob {
  size: number
  
  constructor(parts: any[]) {
    this.size = parts.reduce((acc, part) => acc + String(part).length, 0)
  }
} as any

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('getTemplates', () => {
    it('should return empty array when no templates exist', () => {
      const templates = LocalStorageService.getTemplates()
      expect(templates).toEqual([])
    })

    it('should return parsed templates when they exist', () => {
      const mockTemplates = [
        { id: '1', name: 'Test Workout' },
        { id: '2', name: 'Another Workout' }
      ]
      localStorageMock.setItem('fitforge_workout_templates', JSON.stringify(mockTemplates))
      
      const templates = LocalStorageService.getTemplates()
      expect(templates).toEqual(mockTemplates)
    })

    it('should handle corrupted JSON gracefully', () => {
      localStorageMock.setItem('fitforge_workout_templates', 'invalid json')
      
      const templates = LocalStorageService.getTemplates()
      expect(templates).toEqual([])
    })

    it('should handle non-array data gracefully', () => {
      localStorageMock.setItem('fitforge_workout_templates', JSON.stringify({ not: 'an array' }))
      
      const templates = LocalStorageService.getTemplates()
      expect(templates).toEqual([])
    })
  })

  describe('saveTemplates', () => {
    it('should save templates successfully', () => {
      const templates = [{ id: '1', name: 'Test' }]
      
      const result = LocalStorageService.saveTemplates(templates)
      
      expect(result.success).toBe(true)
      expect(localStorageMock.getItem('fitforge_workout_templates')).toBe(JSON.stringify(templates))
    })

    it('should reject data exceeding 90% of storage limit', () => {
      // Create a large template that exceeds 90% of 5MB
      const largeTemplate = { 
        id: '1', 
        name: 'x'.repeat(4.6 * 1024 * 1024) // 4.6MB string
      }
      
      const result = LocalStorageService.saveTemplates([largeTemplate])
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Storage limit approaching')
    })

    it('should handle quota exceeded error', () => {
      // Mock quota exceeded error
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = () => {
        const error: any = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      }
      
      const result = LocalStorageService.saveTemplates([{ id: '1', name: 'Test' }])
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Storage quota exceeded')
      
      // Restore original
      localStorageMock.setItem = originalSetItem
    })
  })

  describe('getStorageInfo', () => {
    it('should calculate storage usage correctly', () => {
      const templates = [
        { id: '1', name: 'Test Workout 1' },
        { id: '2', name: 'Test Workout 2' }
      ]
      localStorageMock.setItem('fitforge_workout_templates', JSON.stringify(templates))
      
      const info = LocalStorageService.getStorageInfo()
      
      expect(info.used).toBeGreaterThan(0)
      expect(info.available).toBeLessThan(5 * 1024 * 1024)
      expect(info.percentage).toBeGreaterThan(0)
      expect(info.percentage).toBeLessThan(100)
    })

    it('should return zero usage when no templates exist', () => {
      const info = LocalStorageService.getStorageInfo()
      
      expect(info.used).toBe(2) // Empty array "[]"
      expect(info.available).toBe(5 * 1024 * 1024 - 2)
      expect(info.percentage).toBeCloseTo(0, 5)
    })
  })

  describe('canStore', () => {
    it('should allow storing small templates', () => {
      const smallTemplate = { id: '1', name: 'Small Template' }
      
      const canStore = LocalStorageService.canStore(smallTemplate)
      
      expect(canStore).toBe(true)
    })

    it('should reject storing data that would exceed limit', () => {
      // Fill storage with existing data
      const existingData = 'x'.repeat(4.9 * 1024 * 1024) // 4.9MB
      localStorageMock.setItem('fitforge_workout_templates', existingData)
      
      // Try to add more data that would exceed limit
      const newTemplate = { id: '1', name: 'x'.repeat(200 * 1024) } // 200KB
      
      const canStore = LocalStorageService.canStore(newTemplate)
      
      expect(canStore).toBe(false)
    })
  })

  describe('addTemplate', () => {
    it('should add template successfully', () => {
      const template = { id: '1', name: 'New Template' }
      
      const result = LocalStorageService.addTemplate(template)
      
      expect(result.success).toBe(true)
      expect(LocalStorageService.getTemplates()).toContainEqual(template)
    })

    it('should reject adding template when storage is full', () => {
      // Mock canStore to return false
      vi.spyOn(LocalStorageService, 'canStore').mockReturnValue(false)
      
      const result = LocalStorageService.addTemplate({ id: '1', name: 'Test' })
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Not enough storage space')
      
      vi.restoreAllMocks()
    })
  })

  describe('updateTemplate', () => {
    beforeEach(() => {
      const templates = [
        { id: '1', name: 'Template 1', category: 'strength' },
        { id: '2', name: 'Template 2', category: 'endurance' }
      ]
      localStorageMock.setItem('fitforge_workout_templates', JSON.stringify(templates))
    })

    it('should update existing template', () => {
      const result = LocalStorageService.updateTemplate('1', { category: 'hypertrophy' })
      
      expect(result.success).toBe(true)
      
      const templates = LocalStorageService.getTemplates()
      expect(templates[0].category).toBe('hypertrophy')
      expect(templates[0].name).toBe('Template 1') // Other properties preserved
    })

    it('should return error for non-existent template', () => {
      const result = LocalStorageService.updateTemplate('999', { name: 'Updated' })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Template not found.')
    })
  })

  describe('deleteTemplate', () => {
    beforeEach(() => {
      const templates = [
        { id: '1', name: 'Template 1' },
        { id: '2', name: 'Template 2' }
      ]
      localStorageMock.setItem('fitforge_workout_templates', JSON.stringify(templates))
    })

    it('should delete existing template', () => {
      const result = LocalStorageService.deleteTemplate('1')
      
      expect(result.success).toBe(true)
      
      const templates = LocalStorageService.getTemplates()
      expect(templates).toHaveLength(1)
      expect(templates[0].id).toBe('2')
    })

    it('should return error for non-existent template', () => {
      const result = LocalStorageService.deleteTemplate('999')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Template not found.')
    })
  })

  describe('clearAllTemplates', () => {
    it('should clear all templates', () => {
      localStorageMock.setItem('fitforge_workout_templates', JSON.stringify([{ id: '1' }]))
      
      const result = LocalStorageService.clearAllTemplates()
      
      expect(result.success).toBe(true)
      expect(localStorageMock.getItem('fitforge_workout_templates')).toBe(null)
    })

    it('should handle errors gracefully', () => {
      // Mock removeItem to throw error
      const originalRemoveItem = localStorageMock.removeItem
      localStorageMock.removeItem = () => {
        throw new Error('Storage error')
      }
      
      const result = LocalStorageService.clearAllTemplates()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to clear templates.')
      
      // Restore original
      localStorageMock.removeItem = originalRemoveItem
    })
  })
})