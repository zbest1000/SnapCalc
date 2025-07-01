'use client'

import React, { useState } from 'react'
import { X, Calculator, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EngineeringFormula, CalculationResponse } from '@/types/engineering'
import { AIEngineeringAssistant } from '@/lib/ai-engineering-assistant'

interface FormulaCalculatorProps {
  formula: EngineeringFormula
  onClose: () => void
  onCalculationSave?: (calculation: any) => void
}

export function FormulaCalculator({ formula, onClose, onCalculationSave }: FormulaCalculatorProps) {
  const [inputs, setInputs] = useState<Record<string, number>>({})
  const [result, setResult] = useState<CalculationResponse | null>(null)
  const [aiAssistant] = useState(() => new AIEngineeringAssistant())

  const handleInputChange = (symbol: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setInputs(prev => ({ ...prev, [symbol]: numValue }))
  }

  const handleCalculate = () => {
    try {
      const response = aiAssistant.calculateFormula({
        formula,
        inputs
      })
      setResult(response)
    } catch (error) {
      console.error('Calculation error:', error)
    }
  }

  const handleSave = () => {
    if (result && onCalculationSave) {
      onCalculationSave({
        formula: formula.name,
        inputs,
        result: result.result,
        unit: result.unit,
        timestamp: new Date()
      })
    }
    onClose()
  }

  const canCalculate = formula.variables.slice(1).every(variable => 
    inputs[variable.symbol] !== undefined && inputs[variable.symbol] !== 0
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <div className="p-4 border-b border-engineering-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-engineering-900">{formula.name}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-engineering-600 mt-1">{formula.description}</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Formula Display */}
          <div className="bg-engineering-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-4 h-4 text-engineering-600" />
              <span className="text-sm font-medium text-engineering-700">Formula</span>
            </div>
            <code className="text-sm font-mono text-engineering-800">{formula.formula}</code>
          </div>

          {/* Input Variables */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-engineering-700">Input Variables</h3>
            {formula.variables.slice(1).map(variable => (
              <div key={variable.symbol} className="space-y-1">
                <label className="text-xs font-medium text-engineering-600">
                  {variable.symbol} - {variable.name} ({variable.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={variable.defaultValue?.toString() || "Enter value"}
                  onChange={(e) => handleInputChange(variable.symbol, e.target.value)}
                  className="w-full px-3 py-2 border border-engineering-200 rounded focus:outline-none focus:ring-2 focus:ring-engineering-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-engineering-500">{variable.description}</p>
              </div>
            ))}
          </div>

          {/* Calculate Button */}
          <Button 
            onClick={handleCalculate}
            disabled={!canCalculate}
            variant="engineering"
            className="w-full"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate
          </Button>

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Result</span>
                </div>
                <p className="text-lg font-mono text-green-800">
                  {result.result.toFixed(4)} {result.unit}
                </p>
              </div>

              {/* Calculation Steps */}
              {result.steps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-engineering-700">Calculation Steps</h4>
                  {result.steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <ChevronRight className="w-3 h-3 text-engineering-400" />
                      <span className="text-engineering-600">{step.description}:</span>
                      <code className="font-mono text-engineering-800">{step.equation}</code>
                    </div>
                  ))}
                </div>
              )}

              {/* Save Button */}
              <Button onClick={handleSave} variant="outline" className="w-full">
                Save to History
              </Button>
            </div>
          )}

          {/* Example */}
          {formula.examples.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-amber-700 mb-2">Example</h4>
              <p className="text-xs text-amber-600">{formula.examples[0].description}</p>
              <p className="text-xs font-mono text-amber-800 mt-1">
                Result: {formula.examples[0].expectedOutput} {formula.examples[0].outputUnit}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}