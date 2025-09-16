import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from '../settings/Settings'
import { Variable } from '../../types'
import { vi, beforeEach, describe, it, expect } from 'vitest'

describe('Settings', () => {
  const mockVariables: Variable[] = [
    {
      id: 'var-1',
      name: 'name',
      value: 'John Doe',
      description: 'Customer name',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 'var-2',
      name: 'email',
      value: 'john@example.com',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ]

  const mockOnVariableSave = vi.fn()
  const mockOnVariableDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render settings with variables', () => {
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your template variables')).toBeInTheDocument()
    expect(screen.getByText('Add Variable')).toBeInTheDocument()
    expect(screen.getByText('{{name}}')).toBeInTheDocument()
    expect(screen.getByText('{{email}}')).toBeInTheDocument()
  })

  it('should render empty state when no variables', () => {
    render(
      <Settings
        variables={[]}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    expect(screen.getByText('No variables found. Create your first variable to use in templates.')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Variable')).toBeInTheDocument()
  })

  it('should open add variable dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    await user.click(screen.getByText('Add Variable'))

    expect(screen.getByText('Add New Variable')).toBeInTheDocument()
    expect(screen.getByLabelText('Variable Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Default Value')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument()
  })

  it('should save new variable when form is submitted', async () => {
    const user = userEvent.setup()
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    await user.click(screen.getByText('Add Variable'))

    const nameInput = screen.getByLabelText('Variable Name')
    const valueInput = screen.getByLabelText('Default Value')
    const descriptionInput = screen.getByLabelText('Description (Optional)')
    const saveButton = screen.getByText('Save Variable')

    await user.type(nameInput, 'phone')
    await user.type(valueInput, '+1234567890')
    await user.type(descriptionInput, 'Customer phone number')
    await user.click(saveButton)

    expect(mockOnVariableSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'phone',
        value: '+1234567890',
        description: 'Customer phone number',
      })
    )
  })

  it('should edit existing variable when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    expect(screen.getByText('Edit Variable')).toBeInTheDocument()
    expect(screen.getByDisplayValue('name')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Customer name')).toBeInTheDocument()
  })

  it('should delete variable when delete button is clicked', async () => {
    const user = userEvent.setup()
    // Mock window.confirm
    window.confirm = vi.fn(() => true)

    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: /delete variable/i })
    await user.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the variable "name"?')
    expect(mockOnVariableDelete).toHaveBeenCalledWith('var-1')
  })

  it('should not delete variable when confirmation is cancelled', async () => {
    const user = userEvent.setup()
    // Mock window.confirm to return false
    window.confirm = vi.fn(() => false)

    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: /delete variable/i })
    await user.click(deleteButtons[0])

    expect(mockOnVariableDelete).not.toHaveBeenCalled()
  })

  it('should show variable details in cards', () => {
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Customer name')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Created 1/1/2023')).toBeInTheDocument()
    expect(screen.getByText('Created 1/2/2023')).toBeInTheDocument()
  })

  it('should show variable name syntax hint', async () => {
    const user = userEvent.setup()
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    await user.click(screen.getByText('Add Variable'))

    const nameInput = screen.getByLabelText('Variable Name')
    await user.type(nameInput, 'test_var')

    expect(screen.getByText('This will be used as {{test_var}} in templates')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    await user.click(screen.getByText('Add Variable'))

    const saveButton = screen.getByText('Save Variable')
    expect(saveButton).toBeDisabled()

    const nameInput = screen.getByLabelText('Variable Name')
    await user.type(nameInput, 'test')

    expect(saveButton).toBeDisabled()

    const valueInput = screen.getByLabelText('Default Value')
    await user.type(valueInput, 'test value')

    expect(saveButton).not.toBeDisabled()
  })

  it('should cancel dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    await user.click(screen.getByText('Add Variable'))

    const nameInput = screen.getByLabelText('Variable Name')
    await user.type(nameInput, 'test')

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(screen.queryByText('Add New Variable')).not.toBeInTheDocument()
  })

  it('should show variable creation date', () => {
    render(
      <Settings
        variables={mockVariables}
        onVariableSave={mockOnVariableSave}
        onVariableDelete={mockOnVariableDelete}
      />
    )

    expect(screen.getByText('Created 1/1/2023')).toBeInTheDocument()
    expect(screen.getByText('Created 1/2/2023')).toBeInTheDocument()
  })
})
