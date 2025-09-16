import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from '@/components/ui/toaster'
import { TemplateManager } from '@/components/TemplateManager'
import './index.css'

function Popup() {
  return (
    <div className="w-96 h-[600px] bg-background">
      <div className="p-4 h-full overflow-hidden">
        <header className="mb-4">
          <h1 className="text-xl font-bold text-foreground">
            Support Template Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your support templates
          </p>
        </header>
        
        <div className="h-[calc(100%-80px)] overflow-y-auto">
          <TemplateManager />
        </div>
        <Toaster />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)
