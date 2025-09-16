import { StorageService } from '../storage'
import { Template, Variable } from '../../types'
import { vi, describe, beforeEach, it, expect } from 'vitest'

// Mock Chrome storage
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
}

// @ts-ignore
global.chrome = mockChrome

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTemplates', () => {
    it('should return templates from storage', async () => {
      const mockTemplates = [
        {
          id: '1',
          title: 'Test Template',
          content: 'Hello {{name}}',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ]

      mockChrome.storage.local.get.mockResolvedValue({
        support_templates: mockTemplates,
      })

      const result = await StorageService.getTemplates()

      expect(mockChrome.storage.local.get).toHaveBeenCalledWith('support_templates')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test Template')
      expect(result[0].createdAt).toBeInstanceOf(Date)
      expect(result[0].updatedAt).toBeInstanceOf(Date)
    })

    it('should return empty array when no templates exist', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})

      const result = await StorageService.getTemplates()

      expect(result).toEqual([])
    })

    it('should handle storage errors', async () => {
      mockChrome.storage.local.get.mockRejectedValue(new Error('Storage error'))

      const result = await StorageService.getTemplates()

      expect(result).toEqual([])
    })
  })

  describe('saveTemplates', () => {
    it('should save templates to storage', async () => {
      const templates: Template[] = [
        {
          id: '1',
          title: 'Test Template',
          content: 'Hello {{name}}',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockChrome.storage.local.set.mockResolvedValue(undefined)

      await StorageService.saveTemplates(templates)

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        support_templates: templates,
      })
    })

    it('should handle storage errors', async () => {
      const templates: Template[] = []
      mockChrome.storage.local.set.mockRejectedValue(new Error('Storage error'))

      await expect(StorageService.saveTemplates(templates)).rejects.toThrow('Storage error')
    })
  })

  describe('getVariables', () => {
    it('should return variables from storage', async () => {
      const mockVariables = [
        {
          id: '1',
          name: 'name',
          value: 'John Doe',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ]

      mockChrome.storage.local.get.mockResolvedValue({
        support_variables: mockVariables,
      })

      const result = await StorageService.getVariables()

      expect(mockChrome.storage.local.get).toHaveBeenCalledWith('support_variables')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('name')
      expect(result[0].createdAt).toBeInstanceOf(Date)
      expect(result[0].updatedAt).toBeInstanceOf(Date)
    })

    it('should return empty array when no variables exist', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})

      const result = await StorageService.getVariables()

      expect(result).toEqual([])
    })
  })

  describe('saveVariables', () => {
    it('should save variables to storage', async () => {
      const variables: Variable[] = [
        {
          id: '1',
          name: 'name',
          value: 'John Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockChrome.storage.local.set.mockResolvedValue(undefined)

      await StorageService.saveVariables(variables)

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        support_variables: variables,
      })
    })
  })

  describe('getAllData', () => {
    it('should return both templates and variables', async () => {
      const mockTemplates = [
        {
          id: '1',
          title: 'Test Template',
          content: 'Hello {{name}}',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ]

      const mockVariables = [
        {
          id: '1',
          name: 'name',
          value: 'John Doe',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ]

      mockChrome.storage.local.get
        .mockResolvedValueOnce({ support_templates: mockTemplates })
        .mockResolvedValueOnce({ support_variables: mockVariables })

      const result = await StorageService.getAllData()

      expect(result.templates).toHaveLength(1)
      expect(result.variables).toHaveLength(1)
    })
  })

  describe('exportData', () => {
    it('should export data as JSON string', async () => {
      const mockTemplates = [
        {
          id: '1',
          title: 'Test Template',
          content: 'Hello {{name}}',
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        },
      ]

      const mockVariables = [
        {
          id: '1',
          name: 'name',
          value: 'John Doe',
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        },
      ]

      mockChrome.storage.local.get
        .mockResolvedValueOnce({ support_templates: mockTemplates })
        .mockResolvedValueOnce({ support_variables: mockVariables })

      const result = await StorageService.exportData()
      const parsed = JSON.parse(result)

      expect(parsed.templates).toHaveLength(1)
      expect(parsed.variables).toHaveLength(1)
      expect(parsed.version).toBe('1.0.0')
      expect(parsed.exportedAt).toBeDefined()
    })
  })

  describe('importData', () => {
    it('should import data from JSON string', async () => {
      const importData = {
        templates: [
          {
            id: '1',
            title: 'Test Template',
            content: 'Hello {{name}}',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        ],
        variables: [
          {
            id: '1',
            name: 'name',
            value: 'John Doe',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        ],
        version: '1.0.0',
        exportedAt: '2023-01-01T00:00:00.000Z',
      }

      mockChrome.storage.local.set.mockResolvedValue(undefined)

      await StorageService.importData(JSON.stringify(importData))

      expect(mockChrome.storage.local.set).toHaveBeenCalledTimes(2)
    })

    it('should throw error for invalid JSON', async () => {
      await expect(StorageService.importData('invalid json')).rejects.toThrow()
    })

    it('should throw error for invalid data structure', async () => {
      const invalidData = { invalid: 'data' }
      await expect(StorageService.importData(JSON.stringify(invalidData))).rejects.toThrow()
    })
  })

  describe('clearAllData', () => {
    it('should clear all data from storage', async () => {
      mockChrome.storage.local.remove.mockResolvedValue(undefined)

      await StorageService.clearAllData()

      expect(mockChrome.storage.local.remove).toHaveBeenCalledWith([
        'support_templates',
        'support_variables',
      ])
    })
  })
})
