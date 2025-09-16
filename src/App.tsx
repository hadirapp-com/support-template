import { Toaster } from '@/components/ui/toaster'
import { TemplateManager } from '@/components/TemplateManager'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Support Template Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your support templates with variables
          </p>
        </header>
        
        <TemplateManager />
        <Toaster />
      </div>
    </div>
  )
}

export default App
