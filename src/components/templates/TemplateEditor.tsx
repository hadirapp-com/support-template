import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Template, Variable, ValidationError } from '@/types'
import { createTemplate, extractVariables, validateTemplate, processTemplate } from '@/utils/templateProcessor'
import { useToast } from '@/components/ui/use-toast'
import { Save, Plus, AlertCircle, CheckCircle, Eye, PanelRight, PanelRightClose, Copy } from 'lucide-react'

interface TemplateEditorProps {
  templates: Template[]
  variables: Variable[]
  onTemplateSave: (template: Template) => Promise<void>
}

export function TemplateEditor({ templates, variables, onTemplateSave }: TemplateEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showPreviewPanel, setShowPreviewPanel] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Reset form when selected template changes
  useEffect(() => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.title)
      setContent(selectedTemplate.content)
    } else {
      setTitle('')
      setContent('')
    }
    setValidationErrors([])
  }, [selectedTemplate])

  // Validate template when content changes
  useEffect(() => {
    if (content.trim()) {
      const tempTemplate = createTemplate(title || 'Untitled', content)
      const errors = validateTemplate(tempTemplate, variables)
      setValidationErrors(errors)
    } else {
      setValidationErrors([])
    }
  }, [content, variables, title])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both title and content",
        variant: "destructive",
      })
      return
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before saving",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const templateToSave = selectedTemplate
        ? { ...selectedTemplate, title: title.trim(), content: content.trim(), updatedAt: new Date() }
        : createTemplate(title.trim(), content.trim())

      await onTemplateSave(templateToSave)
      
      toast({
        title: "Template saved",
        description: `Template "${templateToSave.title}" has been saved successfully`,
      })

      // Reset form
      setSelectedTemplate(null)
      setTitle('')
      setContent('')
      setValidationErrors([])
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save template",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNewTemplate = () => {
    setSelectedTemplate(null)
    setTitle('')
    setContent('')
    setValidationErrors([])
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
  }

  const availableVariables = extractVariables(content)
  const processedContent = content ? processTemplate(createTemplate(title || 'Preview', content), variables) : ''

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Template Editor</h2>
          <Button 
            onClick={() => setShowPreviewPanel(!showPreviewPanel)} 
            variant="outline" 
            size="sm"
          >
            {showPreviewPanel ? (
              <>
                <PanelRightClose className="w-4 h-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <PanelRight className="w-4 h-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewTemplate} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !content.trim() || validationErrors.length > 0}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {showPreviewPanel ? (
        /* Full Preview Mode */
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>
                Full preview of your template with variables processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {content ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Original Template:</h4>
                    <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded border">
                      {content}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Processed Content:</h4>
                    <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded border">
                      {processedContent}
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigator.clipboard.writeText(processedContent)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Processed Content
                    </Button>
                    <Button 
                      onClick={() => navigator.clipboard.writeText(content)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Original
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No content to preview</p>
                  <p className="text-sm">Start typing in the editor to see the preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Editor Mode */
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                {selectedTemplate ? 'Edit existing template' : 'Create a new template'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Template Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter template title..."
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  Template Content
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your template content. Use {{variable_name}} for variables..."
                  className="min-h-[300px] font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use double curly braces for variables: {`{{variable_name}}`}
                </p>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Validation Errors:</span>
                  </div>
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {error.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Available Variables */}
              {availableVariables.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Variables Found:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {availableVariables.map((variableName) => {
                      const variable = variables.find(v => v.name === variableName)
                      const isValid = !!variable
                      return (
                        <span
                          key={variableName}
                          className={`text-xs px-2 py-1 rounded ${
                            isValid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {`{{${variableName}}}`}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Templates */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Existing Templates</CardTitle>
                <CardDescription>
                  Click to edit an existing template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="font-medium">{template.title}</div>
                      <div className="text-xs opacity-70">
                        {template.content.substring(0, 50)}...
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
