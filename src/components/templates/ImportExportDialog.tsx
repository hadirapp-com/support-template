import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Template, Variable } from '@/types'
import { StorageService } from '@/utils/storage'
import { useToast } from '@/components/ui/use-toast'
import { Download, Upload, FileText } from 'lucide-react'

interface ImportExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: Template[]
  variables: Variable[]
}

export function ImportExportDialog({ open, onOpenChange }: ImportExportDialogProps) {
  const [importData, setImportData] = useState('')
  const [exportData, setExportData] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      setLoading(true)
      const data = await StorageService.exportData()
      setExportData(data)
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "Import failed",
        description: "Please provide valid JSON data",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await StorageService.importData(importData)
      toast({
        title: "Import successful",
        description: "Data has been imported successfully",
      })
      onOpenChange(false)
      setImportData('')
      // Reload the page to reflect changes
      window.location.reload()
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadExport = () => {
    if (!exportData) return

    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `support-templates-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import / Export Templates</DialogTitle>
          <DialogDescription>
            Import or export your templates and variables as JSON files
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Export all templates and variables to a JSON file
                  </p>
                </div>
                <Button onClick={handleExport} disabled={loading}>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Export
                </Button>
              </div>

              {exportData && (
                <div className="space-y-2">
                  <Textarea
                    value={exportData}
                    readOnly
                    className="min-h-[200px] font-mono text-xs"
                    placeholder="Export data will appear here..."
                  />
                  <Button onClick={handleDownloadExport} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Download JSON File
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Import Data</h3>
                <p className="text-sm text-muted-foreground">
                  Import templates and variables from a JSON file
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-xs text-muted-foreground">
                  Or paste JSON data directly below
                </p>
              </div>

              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="min-h-[200px] font-mono text-xs"
                placeholder="Paste your JSON data here..."
              />

              <Button 
                onClick={handleImport} 
                disabled={loading || !importData.trim()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
