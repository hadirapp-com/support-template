import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateList } from '@/components/templates/TemplateList'
import { TemplateEditor } from '@/components/templates/TemplateEditor'
import { Settings } from '@/components/settings/Settings'
import { Template, Variable } from '@/types'
import { StorageService } from '@/utils/storage'

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [variables, setVariables] = useState<Variable[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await StorageService.getAllData()
      setTemplates(data.templates)
      setVariables(data.variables)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSave = async (template: Template) => {
    try {
      const updatedTemplates = templates.find(t => t.id === template.id)
        ? templates.map(t => t.id === template.id ? template : t)
        : [...templates, template]
      
      await StorageService.saveTemplates(updatedTemplates)
      setTemplates(updatedTemplates)
    } catch (error) {
      console.error('Error saving template:', error)
      throw error
    }
  }

  const handleTemplateDelete = async (templateId: string) => {
    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId)
      await StorageService.saveTemplates(updatedTemplates)
      setTemplates(updatedTemplates)
    } catch (error) {
      console.error('Error deleting template:', error)
      throw error
    }
  }

  const handleVariableSave = async (variable: Variable) => {
    try {
      const updatedVariables = variables.find(v => v.id === variable.id)
        ? variables.map(v => v.id === variable.id ? variable : v)
        : [...variables, variable]
      
      await StorageService.saveVariables(updatedVariables)
      setVariables(updatedVariables)
    } catch (error) {
      console.error('Error saving variable:', error)
      throw error
    }
  }

  const handleVariableDelete = async (variableId: string) => {
    try {
      const updatedVariables = variables.filter(v => v.id !== variableId)
      await StorageService.saveVariables(updatedVariables)
      setVariables(updatedVariables)
    } catch (error) {
      console.error('Error deleting variable:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="templates" className="mt-6">
        <TemplateList
          templates={templates}
          variables={variables}
          onTemplateDelete={handleTemplateDelete}
        />
      </TabsContent>
      
      <TabsContent value="editor" className="mt-6">
        <TemplateEditor
          templates={templates}
          variables={variables}
          onTemplateSave={handleTemplateSave}
        />
      </TabsContent>
      
      <TabsContent value="settings" className="mt-6">
        <Settings
          variables={variables}
          onVariableSave={handleVariableSave}
          onVariableDelete={handleVariableDelete}
        />
      </TabsContent>
    </Tabs>
  )
}
