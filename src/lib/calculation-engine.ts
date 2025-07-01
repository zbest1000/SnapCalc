import { evaluate, parse, format } from 'mathjs'
import { CalculationSuggestion } from '@/types/whiteboard'

interface CalculationResult {
  expression: string
  result: number | null
  unit?: string
  confidence: number
  error?: string
}

interface MathContext {
  variables: Record<string, number>
  constants: Record<string, number>
  functions: Record<string, Function>
}

export class CalculationEngine {
  private context: MathContext
  private commonFormulas: Record<string, string>
  private unitConversions: Record<string, Record<string, number>>

  constructor() {
    this.context = {
      variables: {},
      constants: {
        pi: Math.PI,
        e: Math.E,
        c: 299792458, // speed of light
        g: 9.81, // gravity
        phi: 1.618033988749895, // golden ratio
      },
      functions: {}
    }

    this.commonFormulas = {
      // Geometry
      'circle_area': 'pi * r^2',
      'circle_circumference': '2 * pi * r',
      'rectangle_area': 'length * width',
      'triangle_area': '0.5 * base * height',
      'sphere_volume': '(4/3) * pi * r^3',
      'cylinder_volume': 'pi * r^2 * h',
      
      // Physics
      'kinetic_energy': '0.5 * m * v^2',
      'potential_energy': 'm * g * h',
      'force': 'm * a',
      'momentum': 'm * v',
      'power': 'v * i', // electrical
      'ohms_law': 'v / r', // current
      
      // Engineering
      'beam_deflection': '(5 * w * l^4) / (384 * e * i)',
      'stress': 'f / a',
      'strain': 'delta_l / l',
      'pressure': 'f / a',
      
      // Finance
      'simple_interest': 'p * r * t',
      'compound_interest': 'p * (1 + r)^t',
      'present_value': 'fv / (1 + r)^t',
      'future_value': 'pv * (1 + r)^t'
    }

    this.unitConversions = {
      length: {
        mm: 1,
        cm: 10,
        m: 1000,
        km: 1000000,
        in: 25.4,
        ft: 304.8,
        yd: 914.4,
        mi: 1609344
      },
      area: {
        'mm²': 1,
        'cm²': 100,
        'm²': 1000000,
        'in²': 645.16,
        'ft²': 92903.04
      },
      volume: {
        'ml': 1,
        'l': 1000,
        'm³': 1000000,
        'in³': 16387.064,
        'ft³': 28316846.592
      },
      mass: {
        g: 1,
        kg: 1000,
        lb: 453.592,
        oz: 28.3495
      },
      temperature: {
        c: 1,
        f: 1,
        k: 1
      }
    }
  }

  // Parse and evaluate mathematical expressions
  calculate(expression: string, variables?: Record<string, number>): CalculationResult {
    try {
      // Merge provided variables with context
      const scope = { ...this.context.constants, ...this.context.variables, ...variables }
      
      // Clean and normalize expression
      const cleanExpression = this.normalizeExpression(expression)
      
      // Parse and evaluate
      const node = parse(cleanExpression)
      const result = node.evaluate(scope)
      
      return {
        expression: cleanExpression,
        result: typeof result === 'number' ? result : null,
        confidence: 0.95,
        unit: this.extractUnit(expression)
      }
    } catch (error) {
      return {
        expression,
        result: null,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Generate intelligent calculation suggestions
  generateSuggestions(expression: string, context?: any): CalculationSuggestion[] {
    const suggestions: CalculationSuggestion[] = []
    
    // 1. Auto-correction suggestions
    const corrections = this.suggestCorrections(expression)
    suggestions.push(...corrections)
    
    // 2. Alternative interpretations
    const alternatives = this.suggestAlternatives(expression)
    suggestions.push(...alternatives)
    
    // 3. Unit conversion suggestions
    const unitSuggestions = this.suggestUnitConversions(expression)
    suggestions.push(...unitSuggestions)
    
    // 4. Formula suggestions based on context
    const formulaSuggestions = this.suggestFormulas(expression, context)
    suggestions.push(...formulaSuggestions)
    
    // 5. Constant suggestions
    const constantSuggestions = this.suggestConstants(expression)
    suggestions.push(...constantSuggestions)
    
    return suggestions.slice(0, 10) // Limit to top 10 suggestions
  }

  // Suggest corrections for common OCR errors
  private suggestCorrections(expression: string): CalculationSuggestion[] {
    const suggestions: CalculationSuggestion[] = []
    
    const corrections = [
      { pattern: /\bO\b/g, replacement: '0', description: 'Replace O with 0' },
      { pattern: /\bl\b/g, replacement: '1', description: 'Replace l with 1' },
      { pattern: /\bI\b/g, replacement: '1', description: 'Replace I with 1' },
      { pattern: /\bS\b/g, replacement: '5', description: 'Replace S with 5' },
      { pattern: /\bG\b/g, replacement: '6', description: 'Replace G with 6' },
      { pattern: /x/g, replacement: '*', description: 'Replace x with multiplication' },
      { pattern: /÷/g, replacement: '/', description: 'Replace ÷ with division' },
      { pattern: /×/g, replacement: '*', description: 'Replace × with multiplication' }
    ]

    corrections.forEach(({ pattern, replacement, description }) => {
      if (pattern.test(expression)) {
        const correctedExpression = expression.replace(pattern, replacement)
        const result = this.calculate(correctedExpression)
        
        if (result.result !== null) {
          suggestions.push({
            id: crypto.randomUUID(),
            type: 'correction',
            title: `OCR Correction: ${description}`,
            description: `Did you mean: ${correctedExpression}`,
            expression: correctedExpression,
            result: result.result,
            confidence: 0.8,
            reasoning: 'Common OCR character recognition error',
            category: 'arithmetic'
          })
        }
      }
    })

    return suggestions
  }

  // Suggest alternative interpretations
  private suggestAlternatives(expression: string): CalculationSuggestion[] {
    const suggestions: CalculationSuggestion[] = []
    
    // Check for missing operators
    const patterns = [
      { regex: /(\d)(\()/g, replacement: '$1*$2', desc: 'Add multiplication before parentheses' },
      { regex: /(\))(\d)/g, replacement: '$1*$2', desc: 'Add multiplication after parentheses' },
      { regex: /(\d)([a-z])/gi, replacement: '$1*$2', desc: 'Add multiplication before variable' },
      { regex: /([a-z])(\d)/gi, replacement: '$1*$2', desc: 'Add multiplication after variable' }
    ]

    patterns.forEach(({ regex, replacement, desc }) => {
      if (regex.test(expression)) {
        const alternative = expression.replace(regex, replacement)
        const result = this.calculate(alternative)
        
        if (result.result !== null && alternative !== expression) {
          suggestions.push({
            id: crypto.randomUUID(),
            type: 'alternative',
            title: 'Missing Operator',
            description: desc,
            expression: alternative,
            result: result.result,
            confidence: 0.7,
            reasoning: 'Implicit multiplication detected',
            category: 'arithmetic'
          })
        }
      }
    })

    return suggestions
  }

  // Suggest unit conversions
  private suggestUnitConversions(expression: string): CalculationSuggestion[] {
    const suggestions: CalculationSuggestion[] = []
    
    const result = this.calculate(expression)
    if (result.result === null) return suggestions

    const unit = this.extractUnit(expression)
    if (!unit) return suggestions

    // Find conversion category
    let category: string | null = null
    for (const [cat, units] of Object.entries(this.unitConversions)) {
      if (unit in units) {
        category = cat
        break
      }
    }

    if (category && category in this.unitConversions) {
      const conversions = this.unitConversions[category]
      const baseValue = result.result * (conversions[unit] || 1)

      Object.entries(conversions).forEach(([targetUnit, factor]) => {
        if (targetUnit !== unit && typeof factor === 'number') {
          const convertedValue = baseValue / factor
          
          suggestions.push({
            id: crypto.randomUUID(),
            type: 'unit_conversion',
            title: `Convert to ${targetUnit}`,
            description: `${result.result} ${unit} = ${convertedValue.toFixed(4)} ${targetUnit}`,
            expression: `${convertedValue}`,
            result: convertedValue,
            confidence: 0.95,
            reasoning: `Standard unit conversion from ${unit} to ${targetUnit}`,
            category: 'engineering'
          })
        }
      })
    }

    return suggestions.slice(0, 3) // Limit unit conversions
  }

  // Suggest relevant formulas
  private suggestFormulas(expression: string, context?: any): CalculationSuggestion[] {
    const suggestions: CalculationSuggestion[] = []
    
    // Extract variables from expression
    const variables = this.extractVariables(expression)
    
    // Match formulas that use similar variables
    Object.entries(this.commonFormulas).forEach(([name, formula]) => {
      const formulaVars = this.extractVariables(formula)
      const overlap = variables.filter(v => formulaVars.includes(v))
      
      if (overlap.length > 0) {
        const result = this.calculate(formula, this.generateSampleValues(formulaVars))
        
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'formula_suggestion',
          title: `${name.replace(/_/g, ' ').toUpperCase()}`,
          description: `Formula: ${formula}`,
          expression: formula,
          result: result.result || 0,
          confidence: 0.6,
          reasoning: `Detected variables ${overlap.join(', ')} commonly used in this formula`,
          category: this.categorizeFormula(name)
        })
      }
    })

    return suggestions.slice(0, 3)
  }

  // Suggest mathematical constants
  private suggestConstants(expression: string): CalculationSuggestion[] {
    const suggestions: CalculationSuggestion[] = []
    
    const result = this.calculate(expression)
    if (result.result === null) return suggestions

    // Check if result is close to known constants
    Object.entries(this.context.constants).forEach(([name, value]) => {
      const ratio = result.result! / value
      if (ratio > 0.9 && ratio < 1.1) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'constant',
          title: `Similar to ${name}`,
          description: `Your result (${result.result?.toFixed(6)}) is close to ${name} (${value.toFixed(6)})`,
          expression: name,
          result: value,
          confidence: 0.7,
          reasoning: `Mathematical constant ${name} detected`,
          category: 'arithmetic'
        })
      }
    })

    return suggestions
  }

  // Helper methods
  private normalizeExpression(expression: string): string {
    return expression
      .replace(/\s+/g, '') // Remove spaces
      .replace(/×/g, '*') // Replace multiplication symbol
      .replace(/÷/g, '/') // Replace division symbol
      .replace(/\^/g, '**') // Replace power symbol for JavaScript
      .toLowerCase()
  }

  private extractUnit(expression: string): string | undefined {
    const unitPattern = /(mm|cm|m|km|in|ft|yd|mi|mm²|cm²|m²|in²|ft²|ml|l|m³|in³|ft³|g|kg|lb|oz|°c|°f|k)$/i
    const match = expression.match(unitPattern)
    return match ? match[1].toLowerCase() : undefined
  }

  private extractVariables(expression: string): string[] {
    const variables: string[] = []
    const varPattern = /\b[a-z]+\b/gi
    let match
    
    while ((match = varPattern.exec(expression)) !== null) {
      if (!['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs', 'pi', 'e'].includes(match[0].toLowerCase())) {
        variables.push(match[0].toLowerCase())
      }
    }
    
    return Array.from(new Set(variables))
  }

  private generateSampleValues(variables: string[]): Record<string, number> {
    const values: Record<string, number> = {}
    variables.forEach(variable => {
      // Generate reasonable sample values based on common variable names
      switch (variable) {
        case 'r':
        case 'radius':
          values[variable] = 5
          break
        case 'h':
        case 'height':
          values[variable] = 10
          break
        case 'w':
        case 'width':
        case 'length':
          values[variable] = 8
          break
        case 'm':
        case 'mass':
          values[variable] = 2
          break
        case 'v':
        case 'velocity':
        case 'speed':
          values[variable] = 20
          break
        case 'a':
        case 'acceleration':
          values[variable] = 9.81
          break
        case 't':
        case 'time':
          values[variable] = 3
          break
        case 'f':
        case 'force':
          values[variable] = 100
          break
        default:
          values[variable] = 1
      }
    })
    return values
  }

  private categorizeFormula(formulaName: string): CalculationSuggestion['category'] {
    if (formulaName.includes('circle') || formulaName.includes('triangle') || formulaName.includes('rectangle')) {
      return 'geometry'
    }
    if (formulaName.includes('energy') || formulaName.includes('force') || formulaName.includes('momentum')) {
      return 'physics'
    }
    if (formulaName.includes('beam') || formulaName.includes('stress') || formulaName.includes('pressure')) {
      return 'engineering'
    }
    if (formulaName.includes('interest') || formulaName.includes('value')) {
      return 'finance'
    }
    return 'arithmetic'
  }

  // OCR Integration methods
  parseFromOCR(ocrText: string): CalculationResult[] {
    const results: CalculationResult[] = []
    
    // Split text into potential expressions
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    lines.forEach(line => {
      // Look for mathematical expressions
      const mathPatterns = [
        /[\d\+\-\*\/\(\)\=\.\,\s]+/,
        /[\d]+\.?[\d]*\s*[\+\-\*\/]\s*[\d]+\.?[\d]*/,
        /[\d]+\.?[\d]*\s*\=\s*[\d]+\.?[\d]*/
      ]
      
      mathPatterns.forEach(pattern => {
        const match = line.match(pattern)
        if (match) {
          const expression = match[0].replace(/\s*=.*$/, '') // Remove result if present
          const result = this.calculate(expression)
          if (result.result !== null) {
            results.push(result)
          }
        }
      })
    })
    
    return results
  }

  // Advanced features
  solveEquation(equation: string, variable: string): CalculationResult {
    try {
      // Simple equation solving (placeholder for more advanced implementation)
      const result = this.calculate(equation.replace(variable, '1'))
      return {
        expression: equation,
        result: result.result,
        confidence: 0.8
      }
    } catch (error) {
      return {
        expression: equation,
        result: null,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Export/Import calculation context
  exportContext(): MathContext {
    return { ...this.context }
  }

  importContext(context: Partial<MathContext>): void {
    this.context = { ...this.context, ...context }
  }
}