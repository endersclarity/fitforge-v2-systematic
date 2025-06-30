/**
 * localStorage Service Layer
 * 
 * Provides a centralized interface for all localStorage operations with:
 * - Quota protection (5MB limit across all localStorage)
 * - Error handling
 * - Type safety
 * - Storage size monitoring
 * 
 * Note: localStorage has a total limit of 5-10MB (browser dependent) shared
 * across all keys for the domain. With average template size of ~2KB, this
 * allows for approximately 2500 templates before hitting limits.
 */

const STORAGE_KEY = 'fitforge_workout_templates'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB limit

export interface StorageInfo {
  used: number
  available: number
  percentage: number
}

export class LocalStorageService {
  /**
   * Get estimated storage usage for workout templates
   */
  static getStorageInfo(): StorageInfo {
    try {
      const data = localStorage.getItem(STORAGE_KEY) || '[]'
      const used = new Blob([data]).size
      const percentage = (used / MAX_STORAGE_SIZE) * 100
      
      return {
        used,
        available: MAX_STORAGE_SIZE - used,
        percentage
      }
    } catch (error) {
      console.error('Error calculating storage info:', error)
      return { used: 0, available: MAX_STORAGE_SIZE, percentage: 0 }
    }
  }

  /**
   * Check if adding new data would exceed storage limits
   */
  static canStore(newData: any): boolean {
    try {
      const currentData = localStorage.getItem(STORAGE_KEY) || '[]'
      const newDataString = JSON.stringify(newData)
      const totalSize = new Blob([currentData]).size + new Blob([newDataString]).size
      
      return totalSize < MAX_STORAGE_SIZE
    } catch (error) {
      console.error('Error checking storage capacity:', error)
      return false
    }
  }

  /**
   * Safely get templates from localStorage with error handling
   */
  static getTemplates(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error reading templates from localStorage:', error)
      return []
    }
  }

  /**
   * Safely save templates to localStorage with quota protection
   */
  static saveTemplates(templates: any[]): { success: boolean; error?: string } {
    try {
      const data = JSON.stringify(templates)
      const dataSize = new Blob([data]).size
      
      // Check if data exceeds reasonable limits
      if (dataSize > MAX_STORAGE_SIZE * 0.9) {
        return {
          success: false,
          error: 'Storage limit approaching. Please delete some templates.'
        }
      }

      localStorage.setItem(STORAGE_KEY, data)
      return { success: true }
    } catch (error) {
      console.error('Error saving templates:', error)
      
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded. Please delete some templates before saving.'
        }
      }
      
      return {
        success: false,
        error: 'Failed to save templates. Please try again.'
      }
    }
  }

  /**
   * Add a single template with quota checking
   */
  static addTemplate(template: any): { success: boolean; error?: string } {
    const templates = this.getTemplates()
    
    // Check if we can store the new template
    if (!this.canStore(template)) {
      return {
        success: false,
        error: 'Not enough storage space. Please delete some templates first.'
      }
    }

    templates.push(template)
    return this.saveTemplates(templates)
  }

  /**
   * Update a template by ID
   */
  static updateTemplate(id: string, template: any): { success: boolean; error?: string } {
    const templates = this.getTemplates()
    const index = templates.findIndex(t => t.id === id)
    
    if (index === -1) {
      return {
        success: false,
        error: 'Template not found.'
      }
    }

    templates[index] = { ...templates[index], ...template }
    return this.saveTemplates(templates)
  }

  /**
   * Delete a template by ID
   */
  static deleteTemplate(id: string): { success: boolean; error?: string } {
    const templates = this.getTemplates()
    const filtered = templates.filter(t => t.id !== id)
    
    if (filtered.length === templates.length) {
      return {
        success: false,
        error: 'Template not found.'
      }
    }

    return this.saveTemplates(filtered)
  }

  /**
   * Clear all templates (with confirmation)
   */
  static clearAllTemplates(): { success: boolean; error?: string } {
    try {
      localStorage.removeItem(STORAGE_KEY)
      return { success: true }
    } catch (error) {
      console.error('Error clearing templates:', error)
      return {
        success: false,
        error: 'Failed to clear templates.'
      }
    }
  }
}