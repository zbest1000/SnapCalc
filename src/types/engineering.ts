export interface EngineeringFormula {
  id: string
  name: string
  formula: string
  description: string
  category: EngineeringCategory
  variables: Variable[]
  units: UnitSystem[]
  examples: FormulaExample[]
  tags: string[]
}

export interface Variable {
  symbol: string
  name: string
  description: string
  unit: string
  defaultValue?: number
  minValue?: number
  maxValue?: number
}

export interface FormulaExample {
  description: string
  inputs: Record<string, number>
  expectedOutput: number
  outputUnit: string
}

export interface UnitSystem {
  system: 'metric' | 'imperial' | 'both'
  baseUnit: string
  conversions: Record<string, number>
}

export type EngineeringCategory = 
  | 'mechanical'
  | 'electrical' 
  | 'civil'
  | 'chemical'
  | 'structural'
  | 'fluid_dynamics'
  | 'thermodynamics'
  | 'materials'
  | 'automotive'
  | 'aerospace'
  | 'general'

export interface AIRecommendation {
  id: string
  type: 'formula' | 'conversion' | 'calculation' | 'explanation'
  title: string
  description: string
  formula?: EngineeringFormula
  calculation?: string
  confidence: number
  reasoning: string
  category: EngineeringCategory
  examples: string[]
}

export interface EngineeringQuery {
  query: string
  context?: {
    discipline?: EngineeringCategory
    preferredUnits?: 'metric' | 'imperial'
    complexity?: 'basic' | 'intermediate' | 'advanced'
  }
}

export interface CalculationRequest {
  formula: EngineeringFormula
  inputs: Record<string, number>
  outputUnit?: string
}

export interface CalculationResponse {
  result: number
  unit: string
  steps: CalculationStep[]
  formula: EngineeringFormula
  confidence: number
}

export interface CalculationStep {
  description: string
  equation: string
  result: number
  unit?: string
}

export interface UnitConversion {
  from: string
  to: string
  factor: number
  offset?: number
  formula?: string
}