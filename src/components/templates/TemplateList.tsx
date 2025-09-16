import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Template, Variable } from '@/types'
import { processTemplate } from '@/utils/templateProcessor'
import { copyToClipboard } from '@/utils/clipboard'
import { useToast } from '@/components/ui/use-toast'
import { Copy, Trash2, Eye, Download, Upload } from 'lucide-react'
import { ImportExportDialog } from './ImportExportDialog'

interface TemplateListProps {
  templates: Template[]
  variables: Variable[]
  onTemplateDelete: (templateId: string) => Promise<void>
}

export function TemplateList({ templates, variables, onTemplateDelete }: TemplateListProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showImportExport, setShowImportExport] = useState(false)
  const { toast } = useToast()

  const handleCopyTemplate = async (template: Template) => {
    try {
      const processedContent = processTemplate(template, variables)
      await copyToClipboard(processedContent)
      toast({
        title: "Copied to clipboard",
        description: `Template "${template.title}" has been copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy template to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTemplate = async (template: Template) => {
    try {
      await onTemplateDelete(template.id)
      toast({
        title: "Template deleted",
        description: `Template "${template.title}" has been deleted`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template)
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          No templates found. Create your first template in the Editor tab.
        </div>
        <Button onClick={() => setShowImportExport(true)} variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import Templates
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Templates</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowImportExport(true)} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Import/Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const processedContent = processTemplate(template, variables)
          const hasVariables = template.content.includes('{{')
          
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription>
                  Created {template.createdAt.toLocaleDateString()}
                  {hasVariables && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Has Variables
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {processedContent.substring(0, 100)}
                    {processedContent.length > 100 && '...'}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCopyTemplate(template)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreviewTemplate(template)}
                      aria-label="Preview template"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-destructive hover:text-destructive"
                      aria-label="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>
              Preview of processed template content
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Original Template:</h4>
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {selectedTemplate.content}
                </pre>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Processed Content:</h4>
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {processTemplate(selectedTemplate, variables)}
                </pre>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopyTemplate(selectedTemplate)}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Processed Content
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import/Export Dialog */}
      <ImportExportDialog
        open={showImportExport}
        onOpenChange={setShowImportExport}
        templates={templates}
        variables={variables}
      />
    </div>
  )
}
