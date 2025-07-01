import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  WhiteboardProject, 
  WhiteboardElement, 
  DrawingTool, 
  CalculationSuggestion, 
  FileUpload,
  WhiteboardSettings,
  Template
} from '@/types/whiteboard'

interface WhiteboardStore {
  // Current state
  currentProject: WhiteboardProject | null
  activeElements: WhiteboardElement[]
  selectedTool: DrawingTool
  isDrawing: boolean
  zoom: number
  panOffset: { x: number; y: number }
  selectedElementId: string | null
  
  // Projects and templates
  projects: WhiteboardProject[]
  templates: Template[]
  recentProjects: string[]
  
  // Files and uploads
  uploadedFiles: FileUpload[]
  currentFile: FileUpload | null
  
  // Calculations and suggestions
  calculationSuggestions: CalculationSuggestion[]
  autoCalculate: boolean
  
  // Settings
  settings: WhiteboardSettings
  
  // Actions
  createProject: (name: string, template?: Template) => string
  loadProject: (projectId: string) => void
  saveProject: () => void
  deleteProject: (projectId: string) => void
  duplicateProject: (projectId: string) => string
  
  // Element management
  addElement: (element: Omit<WhiteboardElement, 'id' | 'timestamp'>) => void
  updateElement: (elementId: string, updates: Partial<WhiteboardElement>) => void
  deleteElement: (elementId: string) => void
  selectElement: (elementId: string | null) => void
  moveElement: (elementId: string, position: { x: number; y: number }) => void
  duplicateElement: (elementId: string) => void
  
  // Drawing tools
  setTool: (tool: Partial<DrawingTool>) => void
  setDrawing: (isDrawing: boolean) => void
  
  // View controls
  setZoom: (zoom: number) => void
  setPan: (offset: { x: number; y: number }) => void
  resetView: () => void
  fitToScreen: () => void
  
  // File operations
  uploadFile: (file: File) => Promise<void>
  removeFile: (fileId: string) => void
  setCurrentFile: (fileId: string | null) => void
  
  // Calculations
  addCalculationSuggestion: (suggestion: Omit<CalculationSuggestion, 'id'>) => void
  acceptSuggestion: (suggestionId: string) => void
  dismissSuggestion: (suggestionId: string) => void
  clearSuggestions: () => void
  setAutoCalculate: (enabled: boolean) => void
  
  // Settings
  updateSettings: (settings: Partial<WhiteboardSettings>) => void
  
  // Export/Import
  exportProject: (projectId: string, format: string) => Promise<Blob>
  importProject: (data: any) => Promise<string>
  
  // Templates
  saveAsTemplate: (projectId: string, name: string, category: string) => void
  loadTemplate: (templateId: string) => void
  deleteTemplate: (templateId: string) => void
  
  // Utility
  clearHistory: () => void
  getProjectStats: (projectId: string) => any
}

const defaultSettings: WhiteboardSettings = {
  autoSave: true,
  autoSaveInterval: 30000,
  gridVisible: true,
  snapToGrid: false,
  gridSize: 20,
  zoomLevel: 1,
  toolbarPosition: 'top',
  theme: 'light',
  pressureSensitivity: true,
  touchGestures: true,
  multiTouch: true
}

const defaultTool: DrawingTool = {
  type: 'pen',
  color: '#000000',
  strokeWidth: 2,
  opacity: 1
}

export const useWhiteboardStore = create<WhiteboardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProject: null,
      activeElements: [],
      selectedTool: defaultTool,
      isDrawing: false,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      selectedElementId: null,
      
      projects: [],
      templates: [],
      recentProjects: [],
      
      uploadedFiles: [],
      currentFile: null,
      
      calculationSuggestions: [],
      autoCalculate: true,
      
      settings: defaultSettings,

      // Project actions
      createProject: (name: string, template?: Template) => {
        const newProject: WhiteboardProject = {
          id: crypto.randomUUID(),
          name,
          description: '',
          elements: template?.elements || [],
          backgroundType: template?.backgroundType || 'blank',
          dimensions: { width: 1920, height: 1080 },
          created: new Date(),
          lastModified: new Date(),
          tags: [],
          isTemplate: false
        }
        
        set((state) => ({
          projects: [newProject, ...state.projects],
          currentProject: newProject,
          activeElements: newProject.elements,
          recentProjects: [newProject.id, ...state.recentProjects.slice(0, 9)]
        }))
        
        return newProject.id
      },

      loadProject: (projectId: string) => {
        const project = get().projects.find(p => p.id === projectId)
        if (project) {
          set((state) => ({
            currentProject: project,
            activeElements: project.elements,
            recentProjects: [projectId, ...state.recentProjects.filter(id => id !== projectId).slice(0, 9)]
          }))
        }
      },

      saveProject: () => {
        const { currentProject, activeElements } = get()
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            elements: activeElements,
            lastModified: new Date()
          }
          
          set((state) => ({
            currentProject: updatedProject,
            projects: state.projects.map(p => 
              p.id === currentProject.id ? updatedProject : p
            )
          }))
        }
      },

      deleteProject: (projectId: string) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          recentProjects: state.recentProjects.filter(id => id !== projectId),
          currentProject: state.currentProject?.id === projectId ? null : state.currentProject
        }))
      },

      duplicateProject: (projectId: string) => {
        const project = get().projects.find(p => p.id === projectId)
        if (project) {
          const duplicate: WhiteboardProject = {
            ...project,
            id: crypto.randomUUID(),
            name: `${project.name} (Copy)`,
            created: new Date(),
            lastModified: new Date()
          }
          
          set((state) => ({
            projects: [duplicate, ...state.projects]
          }))
          
          return duplicate.id
        }
        return ''
      },

      // Element management
      addElement: (element) => {
        const newElement: WhiteboardElement = {
          ...element,
          id: crypto.randomUUID(),
          timestamp: new Date()
        }
        
        set((state) => ({
          activeElements: [...state.activeElements, newElement]
        }))
      },

      updateElement: (elementId: string, updates: Partial<WhiteboardElement>) => {
        set((state) => ({
          activeElements: state.activeElements.map(el =>
            el.id === elementId ? { ...el, ...updates } : el
          )
        }))
      },

      deleteElement: (elementId: string) => {
        set((state) => ({
          activeElements: state.activeElements.filter(el => el.id !== elementId),
          selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId
        }))
      },

      selectElement: (elementId: string | null) => {
        set({ selectedElementId: elementId })
      },

      moveElement: (elementId: string, position: { x: number; y: number }) => {
        get().updateElement(elementId, { position })
      },

      duplicateElement: (elementId: string) => {
        const element = get().activeElements.find(el => el.id === elementId)
        if (element) {
          const duplicate = {
            ...element,
            position: { x: element.position.x + 20, y: element.position.y + 20 }
          }
          delete (duplicate as any).id
          delete (duplicate as any).timestamp
          get().addElement(duplicate)
        }
      },

      // Drawing tools
      setTool: (tool: Partial<DrawingTool>) => {
        set((state) => ({
          selectedTool: { ...state.selectedTool, ...tool }
        }))
      },

      setDrawing: (isDrawing: boolean) => {
        set({ isDrawing })
      },

      // View controls
      setZoom: (zoom: number) => {
        set({ zoom: Math.max(0.1, Math.min(5, zoom)) })
      },

      setPan: (offset: { x: number; y: number }) => {
        set({ panOffset: offset })
      },

      resetView: () => {
        set({ zoom: 1, panOffset: { x: 0, y: 0 } })
      },

      fitToScreen: () => {
        // Implementation would calculate optimal zoom and pan
        set({ zoom: 1, panOffset: { x: 0, y: 0 } })
      },

      // File operations
      uploadFile: async (file: File) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const uploadedFile: FileUpload = {
              id: crypto.randomUUID(),
              name: file.name,
              type: file.type,
              size: file.size,
              data: e.target?.result as string,
              pages: file.type === 'application/pdf' ? 1 : undefined,
              currentPage: 1,
              uploadDate: new Date()
            }
            
            set((state) => ({
              uploadedFiles: [...state.uploadedFiles, uploadedFile],
              currentFile: uploadedFile
            }))
            
            resolve()
          }
          reader.readAsDataURL(file)
        })
      },

      removeFile: (fileId: string) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter(f => f.id !== fileId),
          currentFile: state.currentFile?.id === fileId ? null : state.currentFile
        }))
      },

      setCurrentFile: (fileId: string | null) => {
        const file = fileId ? get().uploadedFiles.find(f => f.id === fileId) : null
        set({ currentFile: file || null })
      },

      // Calculations
      addCalculationSuggestion: (suggestion) => {
        const newSuggestion: CalculationSuggestion = {
          ...suggestion,
          id: crypto.randomUUID()
        }
        
        set((state) => ({
          calculationSuggestions: [...state.calculationSuggestions, newSuggestion]
        }))
      },

      acceptSuggestion: (suggestionId: string) => {
        const suggestion = get().calculationSuggestions.find(s => s.id === suggestionId)
        if (suggestion) {
          // Convert suggestion to calculation element
          get().addElement({
            type: 'calculation',
            data: {
              expression: suggestion.expression,
              result: suggestion.result,
              confidence: suggestion.confidence,
              verified: true
            },
            position: { x: 100, y: 100 },
            layer: 1
          })
          
          get().dismissSuggestion(suggestionId)
        }
      },

      dismissSuggestion: (suggestionId: string) => {
        set((state) => ({
          calculationSuggestions: state.calculationSuggestions.filter(s => s.id !== suggestionId)
        }))
      },

      clearSuggestions: () => {
        set({ calculationSuggestions: [] })
      },

      setAutoCalculate: (enabled: boolean) => {
        set({ autoCalculate: enabled })
      },

      // Settings
      updateSettings: (settingsUpdate: Partial<WhiteboardSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...settingsUpdate }
        }))
      },

      // Export/Import
      exportProject: async (projectId: string, format: string) => {
        const project = get().projects.find(p => p.id === projectId)
        if (project) {
          const data = JSON.stringify(project, null, 2)
          return new Blob([data], { type: 'application/json' })
        }
        throw new Error('Project not found')
      },

      importProject: async (data: any) => {
        const importedProject: WhiteboardProject = {
          ...data,
          id: crypto.randomUUID(),
          created: new Date(),
          lastModified: new Date()
        }
        
        set((state) => ({
          projects: [importedProject, ...state.projects]
        }))
        
        return importedProject.id
      },

      // Templates
      saveAsTemplate: (projectId: string, name: string, category: string) => {
        const project = get().projects.find(p => p.id === projectId)
        if (project) {
          const template: Template = {
            id: crypto.randomUUID(),
            name,
            description: project.description || '',
            category,
            thumbnailUrl: '',
            elements: project.elements,
            backgroundType: project.backgroundType,
            tags: project.tags,
            isOfficial: false,
            rating: 0,
            downloads: 0
          }
          
          set((state) => ({
            templates: [...state.templates, template]
          }))
        }
      },

      loadTemplate: (templateId: string) => {
        const template = get().templates.find(t => t.id === templateId)
        if (template) {
          get().createProject(`New ${template.name}`, template)
        }
      },

      deleteTemplate: (templateId: string) => {
        set((state) => ({
          templates: state.templates.filter(t => t.id !== templateId)
        }))
      },

      // Utility
      clearHistory: () => {
        set({
          projects: [],
          recentProjects: [],
          currentProject: null,
          activeElements: []
        })
      },

      getProjectStats: (projectId: string) => {
        const project = get().projects.find(p => p.id === projectId)
        if (project) {
          return {
            totalElements: project.elements.length,
            calculations: project.elements.filter(e => e.type === 'calculation').length,
            drawings: project.elements.filter(e => e.type === 'draw').length,
            images: project.elements.filter(e => e.type === 'image').length,
            lastModified: project.lastModified
          }
        }
        return null
      }
    }),
    {
      name: 'whiteboard-storage',
      version: 1,
    }
  )
)