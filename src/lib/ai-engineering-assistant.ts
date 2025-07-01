import { 
  AIRecommendation, 
  EngineeringQuery, 
  EngineeringCategory, 
  CalculationRequest,
  CalculationResponse,
  CalculationStep,
  EngineeringFormula 
} from '@/types/engineering'
import { engineeringFormulas, searchFormulas, getFormulasByCategory } from './engineering-formulas'
import { CalculationEngine } from './calculation-engine'

export class AIEngineeringAssistant {
  private calculationEngine: CalculationEngine
  private keywords: Record<string, EngineeringCategory[]>
  private unitPatterns: Record<string, string[]>

  constructor() {
    this.calculationEngine = new CalculationEngine()
    
    // Keywords for category detection
    this.keywords = {
      'motor': ['mechanical', 'electrical'],
      'rpm': ['mechanical'],
      'speed': ['mechanical'],
      'torque': ['mechanical'],
      'power': ['mechanical', 'electrical'],
      'voltage': ['electrical'],
      'current': ['electrical'],
      'resistance': ['electrical'],
      'flow': ['fluid_dynamics'],
      'pipe': ['fluid_dynamics'],
      'beam': ['structural', 'civil'],
      'load': ['structural', 'civil'],
      'stress': ['structural', 'materials'],
      'heat': ['thermodynamics'],
      'temperature': ['thermodynamics'],
      'pressure': ['fluid_dynamics', 'thermodynamics'],
      'efficiency': ['mechanical', 'electrical'],
      'belt': ['mechanical'],
      'pulley': ['mechanical'],
      'gear': ['mechanical'],
      'pump': ['fluid_dynamics', 'mechanical'],
      'conveyor': ['mechanical'],
      'shaft': ['mechanical'],
      'bearing': ['mechanical']
    }

    this.unitPatterns = {
      'rpm': ['rpm', 'rev/min', 'revolutions per minute'],
      'fpm': ['fpm', 'ft/min', 'feet per minute'],
      'speed': ['m/s', 'ft/s', 'mph', 'km/h'],
      'power': ['hp', 'kw', 'watts', 'horsepower'],
      'voltage': ['v', 'volts', 'kv'],
      'current': ['a', 'amps', 'amperes', 'ma'],
      'flow': ['gpm', 'lpm', 'm³/s', 'cfm'],
      'pressure': ['psi', 'bar', 'pa', 'kpa'],
      'temperature': ['°c', '°f', 'celsius', 'fahrenheit', 'kelvin']
    }
  }

  async analyzeQuery(query: EngineeringQuery): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = []
    const queryText = query.query.toLowerCase()

    // 1. Detect engineering categories
    const detectedCategories = this.detectCategories(queryText)
    
    // 2. Extract units and values
    const extractedData = this.extractUnitsAndValues(queryText)
    
    // 3. Search for relevant formulas
    const relevantFormulas = this.findRelevantFormulas(queryText, detectedCategories)
    
    // 4. Generate specific recommendations
    relevantFormulas.forEach(formula => {
      const recommendation = this.createFormulaRecommendation(formula, queryText, extractedData)
      if (recommendation) {
        recommendations.push(recommendation)
      }
    })

    // 5. Add unit conversion suggestions
    const conversionSuggestions = this.suggestUnitConversions(queryText, extractedData)
    recommendations.push(...conversionSuggestions)

    // 6. Add explanation recommendations
    const explanationSuggestions = this.createExplanationRecommendations(queryText, detectedCategories)
    recommendations.push(...explanationSuggestions)

    // Sort by confidence and limit results
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8)
  }

  private detectCategories(queryText: string): EngineeringCategory[] {
    const categories = new Set<EngineeringCategory>()
    
    for (const [keyword, cats] of Object.entries(this.keywords)) {
      if (queryText.includes(keyword)) {
        for (const cat of cats) {
          categories.add(cat)
        }
      }
    }

    return Array.from(categories)
  }

  private extractUnitsAndValues(queryText: string): { values: number[], units: string[] } {
    const values: number[] = []
    const units: string[] = []

    // Extract numbers
    const numberPattern = /\b\d+\.?\d*\b/g
    const numberMatches = queryText.match(numberPattern)
    if (numberMatches) {
      values.push(...numberMatches.map(Number))
    }

    // Extract units
    for (const unitGroup of Object.values(this.unitPatterns)) {
      for (const unit of unitGroup) {
        if (queryText.includes(unit.toLowerCase())) {
          units.push(unit)
        }
      }
    }

    return { values, units }
  }

  private findRelevantFormulas(queryText: string, categories: EngineeringCategory[]): EngineeringFormula[] {
    // Search by keywords first
    let formulas = searchFormulas(queryText)
    
    // If no direct matches, search by category
    if (formulas.length === 0 && categories.length > 0) {
      const categoryFormulas: EngineeringFormula[] = []
      for (const category of categories) {
        categoryFormulas.push(...getFormulasByCategory(category))
      }
      formulas = categoryFormulas
    }

    // Remove duplicates
    const uniqueFormulas = formulas.filter((formula, index, self) => 
      index === self.findIndex(f => f.id === formula.id)
    )

    return uniqueFormulas.slice(0, 5)
  }

  private createFormulaRecommendation(
    formula: EngineeringFormula, 
    queryText: string,
    extractedData: { values: number[], units: string[] }
  ): AIRecommendation | null {
    // Calculate confidence based on keyword matches
    let confidence = 0.5
    const formulaText = `${formula.name} ${formula.description} ${formula.tags.join(' ')}`.toLowerCase()
    
    // Boost confidence for keyword matches
    queryText.split(' ').forEach(word => {
      if (formulaText.includes(word) && word.length > 2) {
        confidence += 0.1
      }
    })

    // Boost confidence if we have values that match formula variables
    if (extractedData.values.length > 0 && formula.variables.length > 1) {
      confidence += 0.1
    }

    confidence = Math.min(confidence, 0.95)

    const examples = this.generateExamplesForFormula(formula, extractedData)

    return {
      id: crypto.randomUUID(),
      type: 'formula',
      title: formula.name,
      description: formula.description,
      formula,
      confidence,
      reasoning: `Formula matches your query about ${formula.category} engineering. Variables: ${formula.variables.map(v => v.name).join(', ')}`,
      category: formula.category,
      examples
    }
  }

  private suggestUnitConversions(queryText: string, extractedData: { values: number[], units: string[] }): AIRecommendation[] {
    const suggestions: AIRecommendation[] = []

    // Common RPM to FPM conversion
    if (queryText.includes('rpm') && (queryText.includes('fpm') || queryText.includes('feet'))) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'conversion',
        title: 'RPM to FPM Conversion',
        description: 'Convert rotational speed (RPM) to linear speed (FPM)',
        calculation: 'FPM = π × Diameter(ft) × RPM',
        confidence: 0.9,
        reasoning: 'Common conversion in mechanical engineering for belt drives and conveyors',
        category: 'mechanical',
        examples: [
          'Example: 1800 RPM motor with 6-inch pulley (0.5 ft diameter)',
          'FPM = π × 0.5 × 1800 = 2827 ft/min'
        ]
      })
    }

    // RPM to linear speed conversion
    if (queryText.includes('rpm') && (queryText.includes('speed') || queryText.includes('velocity'))) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'conversion',
        title: 'RPM to Linear Speed',
        description: 'Convert rotational speed to linear velocity',
        calculation: 'v = (π × D × RPM) / 60',
        confidence: 0.85,
        reasoning: 'Standard conversion for rotating machinery to linear motion',
        category: 'mechanical',
        examples: [
          'Example: 1500 RPM with 0.2m diameter wheel',
          'v = (π × 0.2 × 1500) / 60 = 15.7 m/s'
        ]
      })
    }

    return suggestions
  }

  private createExplanationRecommendations(queryText: string, categories: EngineeringCategory[]): AIRecommendation[] {
    const suggestions: AIRecommendation[] = []

    // Motor-related explanations
    if (queryText.includes('motor') || queryText.includes('rpm')) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'explanation',
        title: 'Motor Speed Calculations',
        description: 'Understanding motor RPM and speed conversions',
        confidence: 0.7,
        reasoning: 'Educational content about motor calculations',
        category: 'mechanical',
        examples: [
          'Motor RPM is revolutions per minute',
          'Linear speed depends on wheel/pulley diameter',
          'Higher RPM = higher linear speed for same diameter',
          'Gear ratios can change effective speed'
        ]
      })
    }

    // Power calculations
    if (queryText.includes('power') || queryText.includes('horsepower') || queryText.includes('watts')) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'explanation',
        title: 'Power Calculations in Engineering',
        description: 'Mechanical and electrical power relationships',
        confidence: 0.7,
        reasoning: 'Fundamental power concepts in engineering',
        category: categories.includes('electrical') ? 'electrical' : 'mechanical',
        examples: [
          'Mechanical Power: P = T × ω (Torque × Angular velocity)',
          'Electrical Power: P = V × I (Voltage × Current)',
          '1 HP = 746 Watts = 550 ft⋅lb/s',
          'Efficiency = Output Power / Input Power'
        ]
      })
    }

    return suggestions
  }

  private generateExamplesForFormula(formula: EngineeringFormula, extractedData: { values: number[], units: string[] }): string[] {
    const examples: string[] = []

    // Use the formula's built-in examples
    formula.examples.forEach(example => {
      examples.push(`${example.description}: ${example.expectedOutput} ${example.outputUnit}`)
    })

    // Generate custom example if we have extracted values
    if (extractedData.values.length > 0 && formula.variables.length >= 2) {
      try {
        const inputs: Record<string, number> = {}
        formula.variables.slice(1, extractedData.values.length + 1).forEach((variable, index) => {
          inputs[variable.symbol] = extractedData.values[index] || 1
        })

        const result = this.calculateFormula({
          formula,
          inputs
        })

        if (result.result !== null) {
          examples.push(`With your values: ${result.result.toFixed(2)} ${result.unit}`)
        }
      } catch (error) {
        // Ignore calculation errors for examples
      }
    }

    return examples.slice(0, 3)
  }

  calculateFormula(request: CalculationRequest): CalculationResponse {
    const { formula, inputs, outputUnit } = request
    const steps: CalculationStep[] = []

    try {
      // Step 1: Show the formula
      steps.push({
        description: 'Original Formula',
        equation: formula.formula,
        result: 0
      })

      // Step 2: Substitute values
      let substitutedFormula = formula.formula
      Object.entries(inputs).forEach(([symbol, value]) => {
        substitutedFormula = substitutedFormula.replace(new RegExp(`\\b${symbol}\\b`, 'g'), value.toString())
        steps.push({
          description: `Substitute ${symbol} = ${value}`,
          equation: substitutedFormula,
          result: value,
          unit: formula.variables.find(v => v.symbol === symbol)?.unit || ''
        })
      })

      // Step 3: Calculate result
      const calculationResult = this.calculationEngine.calculate(substitutedFormula, inputs)
      
      if (calculationResult.result === null) {
        throw new Error(calculationResult.error || 'Calculation failed')
      }

      const finalUnit = outputUnit || formula.variables[0]?.unit || ''
      
      steps.push({
        description: 'Final Result',
        equation: `= ${calculationResult.result}`,
        result: calculationResult.result,
        unit: finalUnit
      })

      return {
        result: calculationResult.result,
        unit: finalUnit,
        steps,
        formula,
        confidence: calculationResult.confidence
      }

    } catch (error) {
      return {
        result: 0,
        unit: '',
        steps: [{
          description: 'Error',
          equation: error instanceof Error ? error.message : 'Unknown error',
          result: 0
        }],
        formula,
        confidence: 0
      }
    }
  }

  // Quick calculation helpers for common engineering problems
  convertRpmToLinearSpeed(rpm: number, diameter: number, unit: 'metric' | 'imperial' = 'metric'): number {
    if (unit === 'metric') {
      // Result in m/s
      return (Math.PI * diameter * rpm) / 60
    } else {
      // Result in ft/min  
      return Math.PI * diameter * rpm
    }
  }

  convertRpmToFpm(rpm: number, diameterInches: number): number {
    const diameterFeet = diameterInches / 12
    return Math.PI * diameterFeet * rpm
  }

  calculateBeltRatio(driveDiameter: number, drivenDiameter: number): number {
    return drivenDiameter / driveDiameter
  }

  calculateMotorPower(torqueLbFt: number, rpm: number): number {
    return (torqueLbFt * rpm) / 5252
  }

  // Pattern matching for smart suggestions
  detectCalculationType(query: string): string[] {
    const types: string[] = []
    
    const patterns = {
      'rpm_conversion': /rpm.*(?:fpm|feet|speed|linear)/i,
      'power_calculation': /(?:power|horsepower|watts).*(?:torque|rpm)/i,
      'belt_calculation': /(?:belt|pulley).*(?:ratio|speed|diameter)/i,
      'flow_calculation': /(?:flow|gpm|pipe).*(?:diameter|velocity)/i,
      'electrical_power': /(?:voltage|current).*(?:power|watts)/i,
      'motor_efficiency': /(?:efficiency|motor).*(?:input|output)/i
    }

    Object.entries(patterns).forEach(([type, pattern]) => {
      if (pattern.test(query)) {
        types.push(type)
      }
    })

    return types
  }
}