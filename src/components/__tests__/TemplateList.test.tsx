import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateList } from '../templates/TemplateList'
import { Template, Variable } from '../../types'
import { copyToClipboard } from '../../utils/clipboard'
import { vi, beforeEach, describe, it, expect } from 'vitest'

// Mock the clipboard utility
vi.mock('../../utils/clipboard', () => ({
  copyToClipboard: vi.fn(),
}))

// Mock the ImportExportDialog component
vi.mock('../templates/ImportExportDialog', () => ({
  ImportExportDialog: ({ open, onOpenChange }: any) => (
    <div data-testid="import-export-dialog" style={{ display: open ? 'block' : 'none' }}>
      <button onClick={() => onOpenChange(false)}>Close Dialog</button>
    </div>
  ),
}))

const mockCopyToClipboard = copyToClipboard as any

describe('TemplateList', () => {
  const mockTemplates: Template[] = [
    {
      id: 'template-1',
      title: 'Welcome Template',
      content: 'Hello {{name}}, welcome to our service!',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 'template-2',
      title: 'Simple Template',
      content: 'This is a simple message without variables.',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ]

  const mockVariables: Variable[] = [
    {
      id: 'var-1',
      name: 'name',
      value: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const mockOnTemplateDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCopyToClipboard.mockResolvedValue(undefined)
  })

  it('should render empty state when no templates', () => {
    render(
      <TemplateList
        templates={[]}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    expect(screen.getByText('No templates found. Create your first template in the Editor tab.')).toBeInTheDocument()
    expect(screen.getByText('Import Templates')).toBeInTheDocument()
  })

  it('should render templates list', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    expect(screen.getByText('Your Templates')).toBeInTheDocument()
    expect(screen.getByText('Welcome Template')).toBeInTheDocument()
    expect(screen.getByText('Simple Template')).toBeInTheDocument()
    expect(screen.getByText('Has Variables')).toBeInTheDocument()
  })

  it('should copy template to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    const copyButtons = screen.getAllByText('Copy')
    await user.click(copyButtons[0])

    expect(mockCopyToClipboard).toHaveBeenCalledWith('Hello John Doe, welcome to our service!')
  })

  it('should show preview dialog when eye button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    const eyeButtons = screen.getAllByRole('button', { name: /preview template/i })
    await user.click(eyeButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Preview of processed template content')).toBeInTheDocument()
  })

  it('should delete template when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: /delete template/i })
    await user.click(deleteButtons[0])

    expect(mockOnTemplateDelete).toHaveBeenCalledWith('template-1')
  })

  it('should open import/export dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    await user.click(screen.getByText('Import/Export'))

    expect(screen.getByTestId('import-export-dialog')).toBeInTheDocument()
  })

  it('should handle clipboard copy errors', async () => {
    const user = userEvent.setup()
    mockCopyToClipboard.mockRejectedValue(new Error('Clipboard error'))

    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    const copyButtons = screen.getAllByText('Copy')
    await user.click(copyButtons[0])

    // Should not throw error, just show toast
    expect(mockCopyToClipboard).toHaveBeenCalled()
  })

  it('should display processed content in preview', async () => {
    const user = userEvent.setup()
    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    const eyeButtons = screen.getAllByRole('button', { name: /preview template/i })
    await user.click(eyeButtons[0])

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveTextContent('Hello {{name}}, welcome to our service!')
    expect(dialog).toHaveTextContent('Hello John Doe, welcome to our service!')
  })

  it('should show template creation date', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    expect(screen.getByText('Created 1/1/2023')).toBeInTheDocument()
    expect(screen.getByText('Created 1/2/2023')).toBeInTheDocument()
  })

  it('should show variable indicator for templates with variables', () => {
    render(
      <TemplateList
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateDelete={mockOnTemplateDelete}
      />
    )

    expect(screen.getByText('Has Variables')).toBeInTheDocument()
  })
})
