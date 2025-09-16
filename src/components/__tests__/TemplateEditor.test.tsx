import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateEditor } from '../templates/TemplateEditor'
import { Template, Variable } from '../../types'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'

describe('TemplateEditor', () => {
  const mockTemplates: Template[] = [
    {
      id: 'template-1',
      title: 'Welcome Template',
      content: 'Hello {{name}}, welcome!',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
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

  const mockOnTemplateSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock clipboard API properly
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    })
  })

  it('should render template editor with form fields', () => {
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    expect(screen.getByText('Template Editor')).toBeInTheDocument()
    expect(screen.getByLabelText('Template Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Template Content')).toBeInTheDocument()
    expect(screen.getByText('New Template')).toBeInTheDocument()
    expect(screen.getByText('Save Template')).toBeInTheDocument()
  })

  it('should allow entering template title and content', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const titleInput = screen.getByLabelText('Template Title')
    const contentInput = screen.getByLabelText('Template Content')

    await user.type(titleInput, 'My New Template')
    await user.clear(contentInput)
    await user.type(contentInput, 'Hello {{name}}, this is a test!')

    expect(titleInput).toHaveValue('My New Template')
    expect(contentInput).toHaveValue('Hello {{name}}, this is a test!')
  })

  it('should show validation errors for missing variables', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const contentInput = screen.getByLabelText('Template Content')
    await user.clear(contentInput)
    await user.type(contentInput, 'Hello {{missing_var}}, this is a test!')

    // Wait for validation to trigger
    await waitFor(() => {
      expect(screen.getByText('Validation Errors:')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText(/Variable 'missing_var' is not defined/)).toBeInTheDocument()
  })

  it('should show available variables when found', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const contentInput = screen.getByLabelText('Template Content')
    await user.clear(contentInput)
    await user.type(contentInput, 'Hello {{name}}, this is a test!')

    await waitFor(() => {
      expect(screen.getByText('Variables Found:')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText('{{name}}')).toBeInTheDocument()
  })

  it('should save template when save button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const titleInput = screen.getByLabelText('Template Title')
    const contentInput = screen.getByLabelText('Template Content')
    const saveButton = screen.getByText('Save Template')

    await user.type(titleInput, 'My New Template')
    await user.clear(contentInput)
    await user.type(contentInput, 'Hello {{name}}, this is a test!')
    
    // Wait for save button to be enabled
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled()
    }, { timeout: 2000 })
    
    await user.click(saveButton)

    expect(mockOnTemplateSave).toHaveBeenCalled()
  })

  it('should not save template with validation errors', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const titleInput = screen.getByLabelText('Template Title')
    const contentInput = screen.getByLabelText('Template Content')
    const saveButton = screen.getByText('Save Template')

    await user.type(titleInput, 'My New Template')
    await user.clear(contentInput)
    await user.type(contentInput, 'Hello {{missing_var}}, this is a test!')
    
    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText('Validation Errors:')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // The save button should be disabled when there are validation errors
    expect(saveButton).toBeDisabled()
    
    await user.click(saveButton)

    // Save should not be called when there are validation errors
    expect(mockOnTemplateSave).not.toHaveBeenCalled()
  })

  it('should reset form when new template button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const titleInput = screen.getByLabelText('Template Title')
    const contentInput = screen.getByLabelText('Template Content')
    const newTemplateButton = screen.getByText('New Template')

    await user.type(titleInput, 'My Template')
    await user.type(contentInput, 'Some content')
    await user.click(newTemplateButton)

    expect(titleInput).toHaveValue('')
    expect(contentInput).toHaveValue('')
  })

  it('should show existing templates in sidebar', () => {
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    expect(screen.getByText('Existing Templates')).toBeInTheDocument()
    expect(screen.getByText('Welcome Template')).toBeInTheDocument()
  })

  it('should select template when clicked in sidebar', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const templateCard = screen.getByText('Welcome Template')
    await user.click(templateCard)

    const titleInput = screen.getByLabelText('Template Title')
    const contentInput = screen.getByLabelText('Template Content')

    expect(titleInput).toHaveValue('Welcome Template')
    expect(contentInput).toHaveValue('Hello {{name}}, welcome!')
  })

  it('should show preview of processed content when preview panel is toggled', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const contentInput = screen.getByLabelText('Template Content')
    await user.clear(contentInput)
    await user.type(contentInput, 'Hello {{name}}, this is a test!')

    // Click the Show Preview button
    const showPreviewButton = screen.getByText('Show Preview')
    await user.click(showPreviewButton)

    await waitFor(() => {
      expect(screen.getByText('Template Preview')).toBeInTheDocument()
      expect(screen.getByText('Processed Content:')).toBeInTheDocument()
    }, { timeout: 2000 })
    
    // Check that the processed content contains the variable replacement
    const processedContentElement = screen.getByText('Processed Content:').parentElement
    expect(processedContentElement).toHaveTextContent('Hello John Doe, this is a test!')
  })

  it('should show copy buttons in preview mode', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const contentInput = screen.getByLabelText('Template Content')
    await user.type(contentInput, 'Hello {{name}}, this is a test!')

    // Click the Show Preview button
    const showPreviewButton = screen.getByText('Show Preview')
    await user.click(showPreviewButton)

    await waitFor(() => {
      expect(screen.getByText('Template Preview')).toBeInTheDocument()
      expect(screen.getByText('Copy Processed Content')).toBeInTheDocument()
      expect(screen.getByText('Copy Original')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should disable save button when title or content is empty', () => {
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    const saveButton = screen.getByText('Save Template')
    expect(saveButton).toBeDisabled()
  })

  it('should show help text for variable syntax', () => {
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    expect(screen.getByText(/Use double curly braces for variables/)).toBeInTheDocument()
  })

  it('should toggle preview panel when show preview button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TemplateEditor
        templates={mockTemplates}
        variables={mockVariables}
        onTemplateSave={mockOnTemplateSave}
      />
    )

    // Initially should show editor mode
    expect(screen.getByText('Template Details')).toBeInTheDocument()
    expect(screen.queryByText('Template Preview')).not.toBeInTheDocument()

    // Click show preview button
    const showPreviewButton = screen.getByText('Show Preview')
    await user.click(showPreviewButton)

    // Should now show preview mode
    expect(screen.getByText('Template Preview')).toBeInTheDocument()
    expect(screen.getByText('Hide Preview')).toBeInTheDocument()
    expect(screen.queryByText('Template Details')).not.toBeInTheDocument()

    // Click hide preview button
    const hidePreviewButton = screen.getByText('Hide Preview')
    await user.click(hidePreviewButton)

    // Should return to editor mode
    expect(screen.getByText('Template Details')).toBeInTheDocument()
    expect(screen.getByText('Show Preview')).toBeInTheDocument()
    expect(screen.queryByText('Template Preview')).not.toBeInTheDocument()
  })
})
