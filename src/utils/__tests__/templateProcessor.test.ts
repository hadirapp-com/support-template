import {
  extractVariables,
  validateTemplate,
  processTemplate,
  generateId,
  createTemplate,
  createVariable,
} from '../templateProcessor'
import { Template, Variable } from '../../types'
import { describe, it, expect } from 'vitest'

describe('templateProcessor', () => {
  describe('extractVariables', () => {
    it('should extract variables from template content', () => {
      const content = 'Hello {{name}}, your order {{order_id}} is ready.'
      const variables = extractVariables(content)
      expect(variables).toEqual(['name', 'order_id'])
    })

    it('should handle multiple instances of the same variable', () => {
      const content = 'Hello {{name}}, {{name}} is your name.'
      const variables = extractVariables(content)
      expect(variables).toEqual(['name'])
    })

    it('should handle variables with spaces', () => {
      const content = 'Hello {{ agent_name }}, your order is ready.'
      const variables = extractVariables(content)
      expect(variables).toEqual(['agent_name'])
    })

    it('should return empty array for content without variables', () => {
      const content = 'Hello world, this is a simple message.'
      const variables = extractVariables(content)
      expect(variables).toEqual([])
    })

    it('should handle nested braces', () => {
      const content = 'Hello {{name}}, your {{order_{{type}}_id}} is ready.'
      const variables = extractVariables(content)
      expect(variables).toEqual(['name', 'order_{{type'])
    })
  })

  describe('validateTemplate', () => {
    const mockVariables: Variable[] = [
      {
        id: '1',
        name: 'name',
        value: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'order_id',
        value: '12345',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('should return no errors for valid template', () => {
      const template: Template = {
        id: '1',
        title: 'Test Template',
        content: 'Hello {{name}}, your order {{order_id}} is ready.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const errors = validateTemplate(template, mockVariables)
      expect(errors).toEqual([])
    })

    it('should return errors for missing variables', () => {
      const template: Template = {
        id: '1',
        title: 'Test Template',
        content: 'Hello {{name}}, your order {{missing_var}} is ready.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const errors = validateTemplate(template, mockVariables)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('content')
      expect(errors[0].message).toContain('missing_var')
    })

    it('should return multiple errors for multiple missing variables', () => {
      const template: Template = {
        id: '1',
        title: 'Test Template',
        content: 'Hello {{missing1}}, your order {{missing2}} is ready.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const errors = validateTemplate(template, mockVariables)
      expect(errors).toHaveLength(2)
    })
  })

  describe('processTemplate', () => {
    const mockVariables: Variable[] = [
      {
        id: '1',
        name: 'name',
        value: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'order_id',
        value: '12345',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('should replace variables with their values', () => {
      const template: Template = {
        id: '1',
        title: 'Test Template',
        content: 'Hello {{name}}, your order {{order_id}} is ready.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = processTemplate(template, mockVariables)
      expect(result).toBe('Hello John Doe, your order 12345 is ready.')
    })

    it('should keep original text for missing variables', () => {
      const template: Template = {
        id: '1',
        title: 'Test Template',
        content: 'Hello {{name}}, your order {{missing_var}} is ready.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = processTemplate(template, mockVariables)
      expect(result).toBe('Hello John Doe, your order {{missing_var}} is ready.')
    })

    it('should handle variables with spaces', () => {
      const template: Template = {
        id: '1',
        title: 'Test Template',
        content: 'Hello {{ name }}, your order is ready.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = processTemplate(template, mockVariables)
      expect(result).toBe('Hello John Doe, your order is ready.')
    })

    it('should return original content if no variables', () => {
      const template: Template = {
        id: '1',
        title: 'Test Template',
        content: 'Hello world, this is a simple message.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = processTemplate(template, mockVariables)
      expect(result).toBe('Hello world, this is a simple message.')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('createTemplate', () => {
    it('should create a template with correct structure', () => {
      const template = createTemplate('Test Title', 'Test content')
      
      expect(template.title).toBe('Test Title')
      expect(template.content).toBe('Test content')
      expect(template.id).toBeDefined()
      expect(template.createdAt).toBeInstanceOf(Date)
      expect(template.updatedAt).toBeInstanceOf(Date)
      expect(template.createdAt.getTime()).toBe(template.updatedAt.getTime())
    })
  })

  describe('createVariable', () => {
    it('should create a variable with correct structure', () => {
      const variable = createVariable('test_var', 'test value', 'test description')
      
      expect(variable.name).toBe('test_var')
      expect(variable.value).toBe('test value')
      expect(variable.description).toBe('test description')
      expect(variable.id).toBeDefined()
      expect(variable.createdAt).toBeInstanceOf(Date)
      expect(variable.updatedAt).toBeInstanceOf(Date)
    })

    it('should create a variable without description', () => {
      const variable = createVariable('test_var', 'test value')
      
      expect(variable.name).toBe('test_var')
      expect(variable.value).toBe('test value')
      expect(variable.description).toBeUndefined()
    })
  })
})
