'use client'

import React from 'react'
import { Calculator, Zap, BookOpen, Settings, Lightbulb, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AIRecommendation, EngineeringCategory } from '@/types/engineering'

interface RecommendationCardProps {
  recommendation: AIRecommendation
  onSelect: () => void
}

export function RecommendationCard({ recommendation, onSelect }: RecommendationCardProps) {
  const getCategoryIcon = (category: EngineeringCategory) => {
    switch (category) {
      case 'mechanical':
        return <Settings className="w-4 h-4" />
      case 'electrical':
        return <Zap className="w-4 h-4" />
      case 'structural':
      case 'civil':
        return <BookOpen className="w-4 h-4" />
      default:
        return <Calculator className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'formula':
        return <Calculator className="w-4 h-4" />
      case 'conversion':
        return <Zap className="w-4 h-4" />
      case 'explanation':
        return <Lightbulb className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'formula':
        return 'text-blue-600 bg-blue-50'
      case 'conversion':
        return 'text-green-600 bg-green-50'
      case 'explanation':
        return 'text-amber-600 bg-amber-50'
      default:
        return 'text-engineering-600 bg-engineering-50'
    }
  }

  return (
    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer border border-engineering-200" onClick={onSelect}>
      <div className="flex items-start justify-between space-x-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1 rounded ${getTypeColor(recommendation.type)}`}>
              {getTypeIcon(recommendation.type)}
            </div>
            <h3 className="font-medium text-sm text-engineering-900">{recommendation.title}</h3>
            <div className="flex items-center space-x-1 text-xs text-engineering-500">
              {getCategoryIcon(recommendation.category)}
              <span className="capitalize">{recommendation.category.replace('_', ' ')}</span>
            </div>
          </div>
          
          <p className="text-xs text-engineering-600 mb-2">{recommendation.description}</p>
          
          {recommendation.formula && (
            <div className="bg-engineering-50 rounded px-2 py-1 mb-2">
              <code className="text-xs font-mono text-engineering-800">{recommendation.formula.formula}</code>
            </div>
          )}
          
          {recommendation.calculation && (
            <div className="bg-engineering-50 rounded px-2 py-1 mb-2">
              <code className="text-xs font-mono text-engineering-800">{recommendation.calculation}</code>
            </div>
          )}

          {recommendation.examples.length > 0 && (
            <div className="space-y-1">
              {recommendation.examples.slice(0, 2).map((example, index) => (
                <p key={index} className="text-xs text-engineering-500">• {example}</p>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-engineering-500">{(recommendation.confidence * 100).toFixed(0)}% match</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-1 h-6">
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}