import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Variable } from '@/types'
import { createVariable } from '@/utils/templateProcessor'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface SettingsProps {
  variables: Variable[]
  onVariableSave: (variable: Variable) => Promise<void>
  onVariableDelete: (variableId: string) => Promise<void>
}

export function Settings({ variables, onVariableSave, onVariableDelete }: SettingsProps) {
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setName('')
    setValue('')
    setDescription('')
    setEditingVariable(null)
  }

  const handleSave = async () => {
    if (!name.trim() || !value.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and value",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate names (excluding current editing variable)
    const existingVariable = variables.find(v => 
      v.name.toLowerCase() === name.trim().toLowerCase() && 
      v.id !== editingVariable?.id
    )

    if (existingVariable) {
      toast({
        title: "Validation Error",
        description: "A variable with this name already exists",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const variableToSave = editingVariable
        ? { 
            ...editingVariable, 
            name: name.trim(), 
            value: value.trim(), 
            description: description.trim() || undefined,
            updatedAt: new Date() 
          }
        : createVariable(name.trim(), value.trim(), description.trim() || undefined)

      await onVariableSave(variableToSave)
      
      toast({
        title: "Variable saved",
        description: `Variable "${variableToSave.name}" has been saved successfully`,
      })

      resetForm()
      setShowAddDialog(false)
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save variable",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (variable: Variable) => {
    setEditingVariable(variable)
    setName(variable.name)
    setValue(variable.value)
    setDescription(variable.description || '')
    setShowAddDialog(true)
  }

  const handleDelete = async (variable: Variable) => {
    if (window.confirm(`Are you sure you want to delete the variable "${variable.name}"?`)) {
      try {
        await onVariableDelete(variable.id)
        toast({
          title: "Variable deleted",
          description: `Variable "${variable.name}" has been deleted`,
        })
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "Failed to delete variable",
          variant: "destructive",
        })
      }
    }
  }

  const handleNewVariable = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const handleCancel = () => {
    resetForm()
    setShowAddDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="text-muted-foreground">
            Manage your template variables
          </p>
        </div>
        <Button onClick={handleNewVariable}>
          <Plus className="w-4 h-4 mr-2" />
          Add Variable
        </Button>
      </div>

      {variables.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No variables found. Create your first variable to use in templates.
            </div>
            <Button onClick={handleNewVariable}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Variable
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {variables.map((variable) => (
            <Card key={variable.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="font-mono">{`{{${variable.name}}}`}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(variable)}
                      aria-label={`Edit variable ${variable.name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(variable)}
                      className="text-destructive hover:text-destructive"
                      aria-label={`Delete variable ${variable.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Created {variable.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Value:</label>
                    <div className="text-sm bg-muted p-2 rounded font-mono">
                      {variable.value}
                    </div>
                  </div>
                  {variable.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description:</label>
                      <div className="text-sm text-muted-foreground">
                        {variable.description}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Variable Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariable ? 'Edit Variable' : 'Add New Variable'}
            </DialogTitle>
            <DialogDescription>
              {editingVariable 
                ? 'Update the variable details below'
                : 'Create a new variable that can be used in your templates'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="variable-name" className="block text-sm font-medium mb-2">
                Variable Name
              </label>
              <Input
                id="variable-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., agent_name, customer_email"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be used as {`{{${name || 'variable_name'}}}`} in templates
              </p>
            </div>

            <div>
              <label htmlFor="variable-value" className="block text-sm font-medium mb-2">
                Default Value
              </label>
              <Input
                id="variable-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter the default value for this variable"
              />
            </div>

            <div>
              <label htmlFor="variable-description" className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <Textarea
                id="variable-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this variable is used for..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !name.trim() || !value.trim()}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Variable'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
