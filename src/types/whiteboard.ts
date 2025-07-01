export interface WhiteboardElement {
  id: string
  type: 'draw' | 'text' | 'image' | 'calculation' | 'shape' | 'annotation'
  data: any
  position: { x: number; y: number }
  timestamp: Date
  layer: number
}

export interface DrawElement extends WhiteboardElement {
  type: 'draw'
  data: {
    path: string
    color: string
    strokeWidth: number
    opacity: number
  }
}

export interface TextElement extends WhiteboardElement {
  type: 'text'
  data: {
    content: string
    fontSize: number
    fontFamily: string
    color: string
    bold: boolean
    italic: boolean
  }
}

export interface ImageElement extends WhiteboardElement {
  type: 'image'
  data: {
    src: string
    width: number
    height: number
    scale: number
    rotation: number
  }
}

export interface CalculationElement extends WhiteboardElement {
  type: 'calculation'
  data: {
    expression: string
    result: number | null
    unit?: string
    confidence: number
    verified: boolean
    alternatives?: Array<{
      expression: string
      result: number
      confidence: number
    }>
  }
}

export interface ShapeElement extends WhiteboardElement {
  type: 'shape'
  data: {
    shapeType: 'rectangle' | 'circle' | 'line' | 'arrow' | 'triangle'
    dimensions: { width: number; height: number }
    strokeColor: string
    fillColor: string
    strokeWidth: number
  }
}

export interface AnnotationElement extends WhiteboardElement {
  type: 'annotation'
  data: {
    content: string
    annotationType: 'note' | 'highlight' | 'callout' | 'dimension'
    targetElementId?: string
    style: {
      backgroundColor: string
      textColor: string
      borderColor: string
    }
  }
}

export interface WhiteboardProject {
  id: string
  name: string
  description?: string
  elements: WhiteboardElement[]
  backgroundImage?: string
  backgroundType: 'blank' | 'grid' | 'dots' | 'engineering' | 'image'
  dimensions: { width: number; height: number }
  created: Date
  lastModified: Date
  tags: string[]
  isTemplate: boolean
  templateCategory?: string
}

export interface DrawingTool {
  type: 'pen' | 'highlighter' | 'eraser' | 'text' | 'shape' | 'select' | 'pan' | 'zoom'
  color: string
  strokeWidth: number
  opacity: number
  fontSize?: number
  shapeType?: string
}

export interface CalculationSuggestion {
  id: string
  type: 'correction' | 'alternative' | 'unit_conversion' | 'formula_suggestion' | 'constant'
  title: string
  description: string
  expression: string
  result: number
  confidence: number
  reasoning: string
  category: 'arithmetic' | 'algebra' | 'geometry' | 'physics' | 'engineering' | 'finance'
}

export interface FileUpload {
  id: string
  name: string
  type: string
  size: number
  data: string | ArrayBuffer
  pages?: number
  currentPage?: number
  uploadDate: Date
}

export interface WhiteboardSession {
  id: string
  projectId: string
  startTime: Date
  endTime?: Date
  totalStrokes: number
  totalCalculations: number
  collaborators?: string[]
  changes: Array<{
    timestamp: Date
    action: 'add' | 'modify' | 'delete'
    elementId: string
    data: any
  }>
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnailUrl: string
  elements: WhiteboardElement[]
  backgroundType: WhiteboardProject['backgroundType']
  tags: string[]
  isOfficial: boolean
  rating: number
  downloads: number
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg' | 'json'
  quality: number
  includeBackground: boolean
  includeAnnotations: boolean
  pageSize?: 'A4' | 'Letter' | 'Custom'
  customDimensions?: { width: number; height: number }
  layers?: number[]
}

export interface CollaborationSettings {
  enabled: boolean
  allowGuestAccess: boolean
  permissions: {
    view: boolean
    edit: boolean
    comment: boolean
    export: boolean
  }
  shareLink?: string
  expirationDate?: Date
}

export interface WhiteboardSettings {
  autoSave: boolean
  autoSaveInterval: number
  gridVisible: boolean
  snapToGrid: boolean
  gridSize: number
  zoomLevel: number
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right' | 'floating'
  theme: 'light' | 'dark' | 'auto'
  pressureSensitivity: boolean
  touchGestures: boolean
  multiTouch: boolean
}