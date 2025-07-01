'use client'

import React, { useRef, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { saveAs } from 'file-saver'
// Simple toast replacement - you can integrate with your existing toast system
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message)
}
import WhiteboardCanvas from './WhiteboardCanvas'
import WhiteboardToolbar from './WhiteboardToolbar'
import CalculationSuggestions from './CalculationSuggestions'
import { useWhiteboardStore } from '@/lib/whiteboard-store'
import { FileUpload } from '@/types/whiteboard'
import { Button } from '@/components/ui/button'
import { 
  PanelLeftClose, 
  PanelLeftOpen,
  FileText,
  Upload,
  Download,
  Settings,
  Info
} from 'lucide-react'

interface WhiteboardProps {
  className?: string
}

export const Whiteboard: React.FC<WhiteboardProps> = ({
  className = ''
}) => {
  const [canvasInstance, setCanvasInstance] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  
  const {
    currentProject,
    uploadFile,
    setCurrentFile,
    uploadedFiles,
    projects,
    createProject,
    loadProject,
    saveProject,
    settings
  } = useWhiteboardStore()

  // File upload handling
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          await uploadFile(file)
          toast.success(`${file.name} uploaded successfully`)
        } else {
          toast.error(`Unsupported file type: ${file.type}`)
        }
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }, [uploadFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.bmp', '.gif'],
      'application/pdf': ['.pdf'],
      'application/dwg': ['.dwg'],
      'application/dxf': ['.dxf']
    },
    noClick: true
  })

  const handleFileUpload = useCallback((file: File) => {
    onDrop([file])
  }, [onDrop])

  const handleExport = useCallback(async (format: string) => {
    if (!canvasInstance) return

    try {
      switch (format) {
        case 'png':
          const pngData = canvasInstance.exportCanvas('png')
          if (pngData) {
            const link = document.createElement('a')
            link.download = `${currentProject?.name || 'whiteboard'}.png`
            link.href = pngData
            link.click()
            toast.success('Exported as PNG')
          }
          break
        case 'jpg':
          const jpgData = canvasInstance.exportCanvas('jpg')
          if (jpgData) {
            const link = document.createElement('a')
            link.download = `${currentProject?.name || 'whiteboard'}.jpg`
            link.href = jpgData
            link.click()
            toast.success('Exported as JPG')
          }
          break
        case 'json':
          if (currentProject) {
            const blob = new Blob([JSON.stringify(currentProject, null, 2)], {
              type: 'application/json'
            })
            saveAs(blob, `${currentProject.name}.json`)
            toast.success('Exported as JSON')
          }
          break
      }
    } catch (error) {
      toast.error('Export failed')
    }
  }, [currentProject, canvasInstance])

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the whiteboard?')) {
      canvasInstance?.clearCanvas()
      toast.success('Whiteboard cleared')
    }
  }, [canvasInstance])

  const handleNewProject = useCallback(() => {
    const name = prompt('Enter project name:')
    if (name) {
      createProject(name)
      toast.success(`Created project: ${name}`)
    }
  }, [createProject])

  const handleSaveProject = useCallback(() => {
    saveProject()
    toast.success('Project saved')
  }, [saveProject])

  return (
    <div 
      {...getRootProps()}
      className={`whiteboard h-screen flex flex-col bg-gray-50 ${className}`}
    >
      <input {...getInputProps()} />
      
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold">
              {currentProject?.name || 'Untitled Whiteboard'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewProject}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            New
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveProject}
            className="flex items-center gap-2"
          >
            Save
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="p-2"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-blue-50 border-b px-4 py-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Smart Whiteboard Features</h3>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Draw and write calculations - get intelligent suggestions</li>
                <li>• Upload PDF/DWG files as background for annotation</li>
                <li>• Auto-detect mathematical expressions and offer corrections</li>
                <li>• Unit conversions and formula suggestions</li>
                <li>• Export to PNG, JPG, or JSON formats</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white border-r flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b">
              <WhiteboardToolbar
                onFileUpload={handleFileUpload}
                onExport={handleExport}
                onClear={handleClear}
              />
            </div>

            {/* Uploaded Files */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Background Files ({uploadedFiles.length})
              </h3>
              
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No files uploaded</p>
                  <p className="text-xs mt-1">Drag & drop files here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => setCurrentFile(file.id)}
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)}KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Projects */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Recent Projects ({projects.length})
              </h3>
              
              {projects.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => loadProject(project.id)}
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{project.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(project.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculation Suggestions */}
            <div className="flex-1 overflow-hidden">
              <CalculationSuggestions className="h-full border-0 shadow-none" />
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 relative">
          {isDragActive && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center z-50 border-2 border-dashed border-blue-400 rounded-lg m-4">
              <div className="text-center">
                <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-blue-900">Drop files here</p>
                <p className="text-sm text-blue-700">Upload PDFs, images, or DWG files</p>
              </div>
            </div>
          )}
          
                     <div className="h-full p-4">
             <WhiteboardCanvas
               width={settings.theme === 'dark' ? 1200 : 1200}
               height={settings.theme === 'dark' ? 800 : 800}
               className="w-full h-full"
             />
           </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Elements: {currentProject?.elements.length || 0}</span>
          <span>Files: {uploadedFiles.length}</span>
          {currentProject && (
            <span>Last saved: {new Date(currentProject.lastModified).toLocaleTimeString()}</span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span>Grid: {settings.gridVisible ? 'On' : 'Off'}</span>
          <span>Auto-calc: {settings.autoSave ? 'On' : 'Off'}</span>
        </div>
      </div>
    </div>
  )
}

export default Whiteboard