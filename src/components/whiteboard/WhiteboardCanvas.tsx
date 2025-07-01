'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useWhiteboardStore } from '@/lib/whiteboard-store'
import { CalculationEngine } from '@/lib/calculation-engine'
import { WhiteboardElement, DrawElement, TextElement, ImageElement } from '@/types/whiteboard'

interface WhiteboardCanvasProps {
  width?: number
  height?: number
  className?: string
}

interface Point {
  x: number
  y: number
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  width = 1200,
  height = 800,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const calculationEngine = useRef(new CalculationEngine())
  const backgroundImageRef = useRef<HTMLImageElement | null>(null)

  const {
    selectedTool,
    zoom,
    panOffset,
    currentFile,
    activeElements,
    settings,
    addElement,
    updateElement,
    setDrawing,
    addCalculationSuggestion
  } = useWhiteboardStore()

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Configure context
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.imageSmoothingEnabled = true

    contextRef.current = context
    redrawCanvas()
  }, [width, height])

  // Update canvas when elements change
  useEffect(() => {
    redrawCanvas()
  }, [activeElements, currentFile, settings])

  // Handle tool changes
  useEffect(() => {
    if (!contextRef.current) return
    
    const context = contextRef.current
    context.strokeStyle = selectedTool.color
    context.lineWidth = selectedTool.strokeWidth
    context.globalAlpha = selectedTool.opacity
  }, [selectedTool])

  const redrawCanvas = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return

    const context = contextRef.current
    const canvas = canvasRef.current

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Set background
    if (settings.theme === 'dark') {
      context.fillStyle = '#1a1a1a'
    } else {
      context.fillStyle = 'white'
    }
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid if enabled
    if (settings.gridVisible) {
      drawGrid(context, canvas.width, canvas.height, settings.gridSize)
    }

    // Draw background image/file
    if (currentFile && backgroundImageRef.current) {
      context.globalAlpha = 0.7
      context.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height)
      context.globalAlpha = 1
    }

    // Draw all elements
    activeElements.forEach(element => {
      drawElement(context, element)
    })

    // Draw current path if drawing
    if (isDrawing && currentPath.length > 1) {
      context.strokeStyle = selectedTool.color
      context.lineWidth = selectedTool.strokeWidth
      context.globalAlpha = selectedTool.opacity
      
      context.beginPath()
      context.moveTo(currentPath[0].x, currentPath[0].y)
      currentPath.forEach(point => {
        context.lineTo(point.x, point.y)
      })
      context.stroke()
    }
  }, [activeElements, currentFile, settings, isDrawing, currentPath, selectedTool])

  const drawGrid = (context: CanvasRenderingContext2D, width: number, height: number, gridSize: number) => {
    context.strokeStyle = settings.theme === 'dark' ? '#333' : '#e0e0e0'
    context.lineWidth = 1
    context.globalAlpha = 0.5

    for (let x = 0; x <= width; x += gridSize) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }

    for (let y = 0; y <= height; y += gridSize) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }

    context.globalAlpha = 1
  }

  const drawElement = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    switch (element.type) {
      case 'draw':
        drawPath(context, element as DrawElement)
        break
      case 'text':
        drawText(context, element as TextElement)
        break
      case 'image':
        drawImage(context, element as ImageElement)
        break
      case 'shape':
        drawShape(context, element)
        break
      case 'calculation':
        drawCalculation(context, element)
        break
      case 'annotation':
        drawAnnotation(context, element)
        break
    }
  }

  const drawPath = (context: CanvasRenderingContext2D, element: DrawElement) => {
    if (!element.data.path) return

    context.strokeStyle = element.data.color
    context.lineWidth = element.data.strokeWidth
    context.globalAlpha = element.data.opacity

    // Simple path drawing (in real implementation, you'd parse SVG path)
    context.beginPath()
    // For now, just draw a simple line representation
    context.moveTo(element.position.x, element.position.y)
    context.lineTo(element.position.x + 50, element.position.y + 50)
    context.stroke()
    
    context.globalAlpha = 1
  }

  const drawText = (context: CanvasRenderingContext2D, element: TextElement) => {
    const data = element.data
    context.fillStyle = data.color
    context.font = `${data.bold ? 'bold ' : ''}${data.italic ? 'italic ' : ''}${data.fontSize}px ${data.fontFamily}`
    context.fillText(data.content, element.position.x, element.position.y)
  }

  const drawImage = (context: CanvasRenderingContext2D, element: ImageElement) => {
    // Implementation would load and draw image
    context.strokeStyle = '#ccc'
    context.strokeRect(element.position.x, element.position.y, element.data.width, element.data.height)
    context.fillStyle = '#f0f0f0'
    context.fillRect(element.position.x, element.position.y, element.data.width, element.data.height)
    context.fillStyle = '#666'
    context.font = '14px Arial'
    context.fillText('Image', element.position.x + 10, element.position.y + 20)
  }

  const drawShape = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    const data = element.data
    context.strokeStyle = data.strokeColor
    context.lineWidth = data.strokeWidth
    context.fillStyle = data.fillColor

    switch (data.shapeType) {
      case 'rectangle':
        context.strokeRect(element.position.x, element.position.y, data.dimensions.width, data.dimensions.height)
        if (data.fillColor !== 'transparent') {
          context.fillRect(element.position.x, element.position.y, data.dimensions.width, data.dimensions.height)
        }
        break
      case 'circle':
        context.beginPath()
        context.arc(element.position.x + data.dimensions.width/2, element.position.y + data.dimensions.height/2, data.dimensions.width/2, 0, 2 * Math.PI)
        context.stroke()
        if (data.fillColor !== 'transparent') {
          context.fill()
        }
        break
      case 'line':
        context.beginPath()
        context.moveTo(element.position.x, element.position.y)
        context.lineTo(element.position.x + data.dimensions.width, element.position.y + data.dimensions.height)
        context.stroke()
        break
    }
  }

  const drawCalculation = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    const data = element.data
    context.fillStyle = data.verified ? '#4CAF50' : '#FF9800'
    context.fillRect(element.position.x - 5, element.position.y - 20, 200, 40)
    context.fillStyle = 'white'
    context.font = '14px Arial'
    context.fillText(`${data.expression} = ${data.result}`, element.position.x, element.position.y)
  }

  const drawAnnotation = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    const data = element.data
    context.fillStyle = data.style.backgroundColor
    context.fillRect(element.position.x, element.position.y, 150, 30)
    context.fillStyle = data.style.textColor
    context.font = '12px Arial'
    context.fillText(data.content, element.position.x + 5, element.position.y + 20)
  }

  const getCanvasPoint = (e: React.MouseEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / zoom - panOffset.x,
      y: (e.clientY - rect.top) / zoom - panOffset.y
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool.type === 'pen' || selectedTool.type === 'highlighter') {
      setIsDrawing(true)
      setDrawing(true)
      const point = getCanvasPoint(e)
      setCurrentPath([point])
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return

    const point = getCanvasPoint(e)
    setCurrentPath(prev => [...prev, point])
    redrawCanvas()
  }

  const handleMouseUp = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    setDrawing(false)

    // Save the drawn path as an element
    if (currentPath.length > 1) {
      const drawElement: Omit<DrawElement, 'id' | 'timestamp'> = {
        type: 'draw',
        data: {
          path: JSON.stringify(currentPath), // Store as JSON
          color: selectedTool.color,
          strokeWidth: selectedTool.strokeWidth,
          opacity: selectedTool.opacity
        },
        position: { x: currentPath[0].x, y: currentPath[0].y },
        layer: 1
      }
      addElement(drawElement)
    }

    setCurrentPath([])

    // Analyze for calculations if auto-calculate is enabled
    if (settings.autoSave) {
      analyzeForCalculations()
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (selectedTool.type === 'text') {
      const point = getCanvasPoint(e)
      addTextAtPosition(point.x, point.y)
    }
  }

  const addTextAtPosition = useCallback((x: number, y: number) => {
    const text = prompt('Enter text:')
    if (!text) return

    const textElement: Omit<TextElement, 'id' | 'timestamp'> = {
      type: 'text',
      data: {
        content: text,
        fontSize: selectedTool.fontSize || 16,
        fontFamily: 'Arial',
        color: selectedTool.color,
        bold: false,
        italic: false
      },
      position: { x, y },
      layer: 1
    }
    addElement(textElement)
  }, [selectedTool, addElement])

  const addImageFromFile = useCallback((file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      
      img.onload = () => {
        const imageElement: Omit<ImageElement, 'id' | 'timestamp'> = {
          type: 'image',
          data: {
            src: dataUrl,
            width: img.width,
            height: img.height,
            scale: 1,
            rotation: 0
          },
          position: { x: 100, y: 100 },
          layer: 1
        }
        addElement(imageElement)
      }
      
      img.src = dataUrl
    }

    reader.readAsDataURL(file)
  }, [addElement])

  const analyzeForCalculations = useCallback(() => {
    // Extract text from text elements for calculation analysis
    const textElements = activeElements.filter(el => el.type === 'text') as TextElement[]
    
    textElements.forEach(element => {
      const text = element.data.content
      if (text && text.length > 0) {
        const suggestions = calculationEngine.current.generateSuggestions(text)
        suggestions.forEach(suggestion => {
          addCalculationSuggestion(suggestion)
        })
      }
    })
  }, [activeElements, addCalculationSuggestion])

  const clearCanvas = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return
    
    const context = contextRef.current
    const canvas = canvasRef.current
    context.clearRect(0, 0, canvas.width, canvas.height)
    redrawCanvas()
  }, [redrawCanvas])

  const exportCanvas = useCallback((format: 'png' | 'jpg' | 'svg' = 'png') => {
    if (!canvasRef.current) return null

    const canvas = canvasRef.current
    
    switch (format) {
      case 'png':
        return canvas.toDataURL('image/png')
      case 'jpg':
        return canvas.toDataURL('image/jpeg', 0.9)
      default:
        return canvas.toDataURL()
    }
  }, [])

  // Load background file
  useEffect(() => {
    if (!currentFile || !currentFile.type.startsWith('image/')) {
      backgroundImageRef.current = null
      redrawCanvas()
      return
    }

    const img = new Image()
    img.onload = () => {
      backgroundImageRef.current = img
      redrawCanvas()
    }
    img.src = currentFile.data as string
  }, [currentFile, redrawCanvas])

  return (
    <div className={`whiteboard-canvas ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg shadow-sm"
        style={{ 
          cursor: selectedTool.type === 'pen' || selectedTool.type === 'highlighter' ? 'crosshair' : 'default',
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'top left'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  )
}

export default WhiteboardCanvas