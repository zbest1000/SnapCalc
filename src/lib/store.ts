import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Calculation {
  id: string
  timestamp: Date
  image: string
  ocrText: string
  result: number | null
  expression: string
  confidence: number
  verified: boolean
  tags: string[]
  notes: string
}

interface CalculationStore {
  calculations: Calculation[]
  isProcessing: boolean
  addCalculation: (calculation: Omit<Calculation, 'id' | 'timestamp'>) => void
  updateCalculation: (id: string, updates: Partial<Calculation>) => void
  deleteCalculation: (id: string) => void
  setProcessing: (processing: boolean) => void
  clearHistory: () => void
}

export const useCalculationStore = create<CalculationStore>()(
  persist(
    (set, get) => ({
      calculations: [],
      isProcessing: false,

      addCalculation: (calculation) => {
        const newCalculation: Calculation = {
          ...calculation,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        set((state) => ({
          calculations: [newCalculation, ...state.calculations],
        }))
      },

      updateCalculation: (id, updates) => {
        set((state) => ({
          calculations: state.calculations.map((calc) =>
            calc.id === id ? { ...calc, ...updates } : calc
          ),
        }))
      },

      deleteCalculation: (id) => {
        set((state) => ({
          calculations: state.calculations.filter((calc) => calc.id !== id),
        }))
      },

      setProcessing: (processing) => {
        set({ isProcessing: processing })
      },

      clearHistory: () => {
        set({ calculations: [] })
      },
    }),
    {
      name: 'snapcalc-storage',
      version: 1,
    }
  )
)