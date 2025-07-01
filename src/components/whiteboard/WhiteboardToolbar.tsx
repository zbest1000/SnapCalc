'use client'

import React, { useState } from 'react'
import { ChromePicker } from 'react-color'
import { 
  Pen, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  Minus, 
  MousePointer, 
  Upload,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  Grid,
  Settings,
  Calculator,
  FileText,
  Image as ImageIcon,
  Undo,
  Redo,
  Save,
  FolderOpen
} from 'lucide-react'
import { useWhiteboardStore } from '@/lib/whiteboard-store'
import { Button } from '@/components/ui/button'

interface WhiteboardToolbarProps {
  onFileUpload?: (file: File) => void
  onExport?: (format: string) => void
  onClear?: () => void
  className?: string
}

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  onFileUpload,
  onExport,
  onClear,
  className = ''
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showStrokeWidthSelector, setShowStrokeWidthSelector] = useState(false)
  
  const {
    selectedTool,
    zoom,
    settings,
    setTool,
    setZoom,
    updateSettings,
    resetView,
    saveProject,
    createProject
  } = useWhiteboardStore()

  const tools = [
    { type: 'select', icon: MousePointer, label: 'Select' },
    { type: 'pen', icon: Pen, label: 'Pen' },
    { type: 'highlighter', icon: Pen, label: 'Highlighter' },
    { type: 'eraser', icon: Eraser, label: 'Eraser' },
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'shape', icon: Square, label: 'Shapes' }
  ]

  const shapes = [
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'line', icon: Minus, label: 'Line' }
  ]

  const strokeWidths = [1, 2, 4, 6, 8, 12, 16, 20]

  const handleToolSelect = (toolType: string) => {
    setTool({ type: toolType as any })
  }

  const handleColorChange = (color: any) => {
    setTool({ color: color.hex })
  }

  const handleStrokeWidthChange = (width: number) => {
    setTool({ strokeWidth: width })
    setShowStrokeWidthSelector(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
    }
  }

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    switch (direction) {
      case 'in':
        setZoom(Math.min(zoom * 1.2, 5))
        break
      case 'out':
        setZoom(Math.max(zoom * 0.8, 0.1))
        break
      case 'reset':
        resetView()
        break
    }
  }

  const toggleGrid = () => {
    updateSettings({ gridVisible: !settings.gridVisible })
  }

  return (
    <div className={`whiteboard-toolbar bg-white border rounded-lg shadow-lg p-4 ${className}`}>
      {/* Main Tools */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 border rounded p-1">
          {tools.map(tool => (
            <Button
              key={tool.type}
              variant={selectedTool.type === tool.type ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleToolSelect(tool.type)}
              className="p-2"
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Color Picker */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2"
            title="Color"
          >
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: selectedTool.color }}
            />
          </Button>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-2">
              <div className="bg-white p-2 border rounded shadow-lg">
                <ChromePicker
                  color={selectedTool.color}
                  onChange={handleColorChange}
                  disableAlpha={false}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowColorPicker(false)}
                  className="mt-2 w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stroke Width */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStrokeWidthSelector(!showStrokeWidthSelector)}
            className="px-3"
            title="Stroke Width"
          >
            {selectedTool.strokeWidth}px
          </Button>
          {showStrokeWidthSelector && (
            <div className="absolute top-full left-0 z-50 mt-2 bg-white border rounded shadow-lg p-2">
              <div className="grid grid-cols-4 gap-1">
                {strokeWidths.map(width => (
                  <Button
                    key={width}
                    variant={selectedTool.strokeWidth === width ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleStrokeWidthChange(width)}
                    className="p-2"
                  >
                    <div 
                      className="rounded-full bg-current"
                      style={{ width: Math.min(width, 16), height: Math.min(width, 16) }}
                    />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shapes (when shape tool is selected) */}
        {selectedTool.type === 'shape' && (
          <div className="flex gap-1 border rounded p-1">
            {shapes.map(shape => (
              <Button
                key={shape.type}
                variant={selectedTool.shapeType === shape.type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTool({ shapeType: shape.type })}
                className="p-2"
                title={shape.label}
              >
                <shape.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* File Operations */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => createProject('New Project')}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          New
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => saveProject()}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>

        <label className="cursor-pointer">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            asChild
          >
            <span>
              <Upload className="w-4 h-4" />
              Upload
            </span>
          </Button>
          <input
            type="file"
            accept="image/*,.pdf,.dwg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport?.('png')}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-2 text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      {/* View Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleZoom('out')}
          className="p-2"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <span className="flex items-center px-2 text-sm bg-gray-100 rounded">
          {Math.round(zoom * 100)}%
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleZoom('in')}
          className="p-2"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleZoom('reset')}
          className="text-xs px-2"
          title="Reset View"
        >
          Fit
        </Button>

        <Button
          variant={settings.gridVisible ? 'default' : 'outline'}
          size="sm"
          onClick={toggleGrid}
          className="p-2"
          title="Toggle Grid"
        >
          <Grid className="w-4 h-4" />
        </Button>
      </div>

      {/* Additional Tools */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          title="Calculator"
        >
          <Calculator className="w-4 h-4" />
          Calc
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="p-2"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="p-2"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="p-2"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Tool-specific options */}
      {selectedTool.type === 'text' && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-2 items-center">
            <label className="text-sm">Font Size:</label>
            <input
              type="range"
              min="8"
              max="72"
              value={selectedTool.fontSize || 16}
              onChange={(e) => setTool({ fontSize: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm w-8">{selectedTool.fontSize || 16}</span>
          </div>
        </div>
      )}

      {selectedTool.type === 'highlighter' && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-2 items-center">
            <label className="text-sm">Opacity:</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={selectedTool.opacity}
              onChange={(e) => setTool({ opacity: parseFloat(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm w-8">{Math.round(selectedTool.opacity * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhiteboardToolbar