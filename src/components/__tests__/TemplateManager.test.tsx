import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateManager } from '../TemplateManager'
import { StorageService } from '../../utils/storage'
import { vi } from 'vitest'

// Mock the child components
vi.mock('../templates/TemplateList', () => ({
  TemplateList: ({ templates, onTemplateDelete }: any) => (
    <div data-testid="template-list">
      <div>Templates: {templates.length}</div>
      <button onClick={() => onTemplateDelete('template-1')}>Delete Template</button>
    </div>
  ),
}))

vi.mock('../templates/TemplateEditor', () => ({
  TemplateEditor: ({ templates, onTemplateSave }: any) => (
    <div data-testid="template-editor">
      <div>Templates: {templates.length}</div>
      <button onClick={() => onTemplateSave({ id: 'template-1', title: 'Test' })}>Save Template</button>
    </div>
  ),
}))

vi.mock('../settings/Settings', () => ({
  Settings: ({ variables, onVariableSave, onVariableDelete }: any) => (
    <div data-testid="settings">
      <div>Variables: {variables.length}</div>
      <button onClick={() => onVariableSave({ id: 'var-1', name: 'test' })}>Save Variable</button>
      <button onClick={() => onVariableDelete('var-1')}>Delete Variable</button>
    </div>
  ),
}))

// Mock StorageService
vi.mock('../../utils/storage', () => ({
  StorageService: {
    getAllData: vi.fn(),
    saveTemplates: vi.fn(),
    saveVariables: vi.fn(),
  },
}))

const mockStorageService = StorageService as any

describe('TemplateManager', () => {
  const mockTemplates = [
    {
      id: 'template-1',
      title: 'Test Template',
      content: 'Hello {{name}}',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const mockVariables = [
    {
      id: 'var-1',
      name: 'name',
      value: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockStorageService.getAllData.mockResolvedValue({
      templates: mockTemplates,
      variables: mockVariables,
    })
    mockStorageService.saveTemplates.mockResolvedValue(undefined)
    mockStorageService.saveVariables.mockResolvedValue(undefined)
  })

  it('should render loading state initially', () => {
    render(<TemplateManager />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should load and display data after mounting', async () => {
    render(<TemplateManager />)

    await waitFor(() => {
      expect(mockStorageService.getAllData).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Templates')).toBeInTheDocument()
      expect(screen.getByText('Editor')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  it('should display templates tab by default', async () => {
    render(<TemplateManager />)

    await waitFor(() => {
      expect(screen.getByTestId('template-list')).toBeInTheDocument()
    })

    expect(screen.getByText('Templates: 1')).toBeInTheDocument()
  })

  it('should switch to editor tab when clicked', async () => {
    const user = userEvent.setup()
    render(<TemplateManager />)

    await waitFor(() => {
      expect(screen.getByText('Editor')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Editor'))

    expect(screen.getByTestId('template-editor')).toBeInTheDocument()
    expect(screen.getByText('Templates: 1')).toBeInTheDocument()
  })

  it('should switch to settings tab when clicked', async () => {
    const user = userEvent.setup()
    render(<TemplateManager />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Settings'))

    expect(screen.getByTestId('settings')).toBeInTheDocument()
    expect(screen.getByText('Variables: 1')).toBeInTheDocument()
  })

  it('should handle template save', async () => {
    const user = userEvent.setup()
    render(<TemplateManager />)

    await waitFor(() => {
      expect(screen.getByText('Editor')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Editor'))
    await user.click(screen.getByText('Save Template'))

    expect(mockStorageService.saveTemplates).toHaveBeenCalled()
  })

  it('should handle template delete', async () => {
    const user = userEvent.setup()
    render(<TemplateManager />)

    await waitFor(() => {
      expect(screen.getByText('Templates')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Delete Template'))

    expect(mockStorageService.saveTemplates).toHaveBeenCalled()
  })

  it('should handle variable save', async () => {
    const user = userEvent.setup()
    render(<TemplateManager />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Settings'))
    await user.click(screen.getByText('Save Variable'))

    expect(mockStorageService.saveVariables).toHaveBeenCalled()
  })

  it('should handle variable delete', async () => {
    const user = userEvent.setup()
    render(<TemplateManager />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Settings'))
    await user.click(screen.getByText('Delete Variable'))

    expect(mockStorageService.saveVariables).toHaveBeenCalled()
  })

  it('should handle storage errors gracefully', async () => {
    mockStorageService.getAllData.mockRejectedValue(new Error('Storage error'))
    
    render(<TemplateManager />)

    await waitFor(() => {
      expect(screen.getByText('Templates')).toBeInTheDocument()
    })

    // Should still render the interface even if data loading fails
    expect(screen.getByText('Templates: 0')).toBeInTheDocument()
  })
})
