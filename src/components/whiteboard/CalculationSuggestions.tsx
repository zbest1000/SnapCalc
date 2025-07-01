'use client'

import React from 'react'
import { 
  Calculator, 
  CheckCircle, 
  X, 
  Lightbulb, 
  ArrowRight,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react'
import { useWhiteboardStore } from '@/lib/whiteboard-store'
import { CalculationSuggestion } from '@/types/whiteboard'
import { Button } from '@/components/ui/button'

interface CalculationSuggestionsProps {
  className?: string
}

const getSuggestionIcon = (type: CalculationSuggestion['type']) => {
  switch (type) {
    case 'correction':
      return <Target className="w-4 h-4 text-orange-500" />
    case 'alternative':
      return <ArrowRight className="w-4 h-4 text-blue-500" />
    case 'unit_conversion':
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case 'formula_suggestion':
      return <Lightbulb className="w-4 h-4 text-yellow-500" />
    case 'constant':
      return <Zap className="w-4 h-4 text-purple-500" />
    default:
      return <Calculator className="w-4 h-4 text-gray-500" />
  }
}

const getSuggestionBadgeColor = (type: CalculationSuggestion['type']) => {
  switch (type) {
    case 'correction':
      return 'bg-orange-100 text-orange-800'
    case 'alternative':
      return 'bg-blue-100 text-blue-800'
    case 'unit_conversion':
      return 'bg-green-100 text-green-800'
    case 'formula_suggestion':
      return 'bg-yellow-100 text-yellow-800'
    case 'constant':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'text-green-600'
  if (confidence >= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

export const CalculationSuggestions: React.FC<CalculationSuggestionsProps> = ({
  className = ''
}) => {
  const {
    calculationSuggestions,
    acceptSuggestion,
    dismissSuggestion,
    clearSuggestions,
    autoCalculate,
    setAutoCalculate
  } = useWhiteboardStore()

  if (calculationSuggestions.length === 0) {
    return (
      <div className={`calculation-suggestions bg-white border rounded-lg shadow-sm p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Calculation Assistant
          </h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoCalculate}
              onChange={(e) => setAutoCalculate(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-xs text-gray-600">Auto-analyze</span>
          </label>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No calculation suggestions</p>
          <p className="text-xs mt-1">Draw or write math expressions to get intelligent suggestions</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`calculation-suggestions bg-white border rounded-lg shadow-sm ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Calculation Suggestions ({calculationSuggestions.length})
          </h3>
          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoCalculate}
                onChange={(e) => setAutoCalculate(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-xs text-gray-600">Auto</span>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSuggestions}
              className="text-xs px-2 py-1 h-auto"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {calculationSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-4 border-b last:border-b-0 hover:bg-gray-50"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getSuggestionIcon(suggestion.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSuggestionBadgeColor(suggestion.type)}`}>
                    {suggestion.type.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {suggestion.description}
                </p>
                
                <div className="bg-gray-50 rounded p-2 mb-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-900">
                      {suggestion.expression}
                    </code>
                    <span className="text-sm font-medium text-gray-900">
                      = {suggestion.result.toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {Math.round(suggestion.confidence * 100)}% confident
                    </span>
                    <span className="text-xs text-gray-500">
                      {suggestion.category}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="p-1 h-auto text-gray-400 hover:text-gray-600"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => acceptSuggestion(suggestion.id)}
                      className="px-3 py-1 h-auto text-xs"
                      title="Accept and add to whiteboard"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
                
                {suggestion.reasoning && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Why this suggestion?
                    </summary>
                    <p className="text-xs text-gray-600 mt-1 pl-2 border-l-2 border-gray-200">
                      {suggestion.reasoning}
                    </p>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalculationSuggestions