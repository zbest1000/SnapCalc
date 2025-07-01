import React, { useState } from 'react'
import { Search, Download, Trash2, Edit3, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/fade-in'
import { SlideIn } from '@/components/ui/slide-in'
import { StaggerContainer } from '@/components/ui/stagger-container'
import { MagneticEffect } from '@/components/ui/magnetic-effect'
import { Calculation, useCalculationStore } from '@/lib/store'
import { formatTimestamp, downloadAsJSON } from '@/lib/utils'

interface CalculationHistoryProps {
  calculations: Calculation[]
}

export function CalculationHistory({ calculations }: CalculationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  
  const { updateCalculation, deleteCalculation, clearHistory } = useCalculationStore()

  const filteredCalculations = calculations.filter(calc =>
    calc.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
    calc.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    calc.ocrText.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalCalculations: calculations.length,
      calculations: calculations.map(calc => ({
        ...calc,
        timestamp: calc.timestamp.toISOString()
      }))
    }
    downloadAsJSON(exportData, `snapcalc-export-${new Date().toISOString().split('T')[0]}.json`)
  }

  const startEditing = (calc: Calculation) => {
    setEditingId(calc.id)
    setEditNotes(calc.notes)
  }

  const saveEdit = () => {
    if (editingId) {
      updateCalculation(editingId, { notes: editNotes })
      setEditingId(null)
      setEditNotes('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditNotes('')
  }

  if (calculations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FadeIn delay={0.2}>
          <div className="w-20 h-20 bg-engineering-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-engineering-400" />
          </div>
        </FadeIn>
        <FadeIn delay={0.4} direction="up">
          <h2 className="text-xl font-semibold text-engineering-900 mb-2">No Calculations Yet</h2>
        </FadeIn>
        <FadeIn delay={0.6} direction="up">
          <p className="text-engineering-600 mb-6">
            Start capturing calculations with the camera to see them here.
          </p>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-b border-engineering-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-engineering-900">
            History ({calculations.length})
          </h2>
          <div className="flex space-x-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button 
              onClick={clearHistory} 
              variant="outline" 
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-engineering-400" />
          <input
            type="text"
            placeholder="Search calculations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-engineering-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-engineering-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Calculations List */}
      <div className="flex-1 overflow-y-auto">
        <StaggerContainer delay={0.2} staggerDelay={0.1}>
          <div className="space-y-3 p-4">
            {filteredCalculations.map((calculation, index) => (
              <SlideIn 
                key={calculation.id} 
                delay={index * 0.05}
                direction="up"
                className="bg-white/80 backdrop-blur-sm rounded-lg border border-engineering-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg font-mono text-engineering-900">
                        {calculation.expression}
                      </span>
                      {calculation.result !== null && (
                        <span className="text-lg font-mono text-engineering-600">
                          = {calculation.result}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-engineering-500">
                      <span>{formatTimestamp(calculation.timestamp)}</span>
                      <span>•</span>
                      <span>{calculation.confidence.toFixed(0)}% confidence</span>
                      {!calculation.verified && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600">Unverified</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                                     <div className="flex space-x-1">
                     <MagneticEffect>
                       <Button
                         onClick={() => startEditing(calculation)}
                         variant="ghost"
                         size="icon"
                         className="w-8 h-8"
                       >
                         <Edit3 className="w-4 h-4" />
                       </Button>
                     </MagneticEffect>
                     <MagneticEffect>
                       <Button
                         onClick={() => deleteCalculation(calculation.id)}
                         variant="ghost"
                         size="icon"
                         className="w-8 h-8 text-red-600 hover:text-red-700"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </MagneticEffect>
                   </div>
                </div>

                {/* Image preview */}
                <div className="mb-3">
                  <img 
                    src={calculation.image} 
                    alt="Calculation" 
                    className="w-full h-32 object-cover rounded border border-engineering-200"
                  />
                </div>

                {/* OCR Text */}
                {calculation.ocrText && (
                  <div className="mb-3 p-2 bg-engineering-50 rounded text-sm">
                    <span className="text-engineering-600 font-medium">OCR: </span>
                    <span className="text-engineering-700">{calculation.ocrText}</span>
                  </div>
                )}

                {/* Notes */}
                {editingId === calculation.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full p-2 border border-engineering-200 rounded text-sm resize-none"
                      rows={3}
                    />
                                         <div className="flex space-x-2">
                       <MagneticEffect>
                         <Button onClick={saveEdit} variant="engineering" size="sm">
                           <Check className="w-4 h-4 mr-1" />
                           Save
                         </Button>
                       </MagneticEffect>
                       <MagneticEffect>
                         <Button onClick={cancelEdit} variant="outline" size="sm">
                           <X className="w-4 h-4 mr-1" />
                           Cancel
                         </Button>
                       </MagneticEffect>
                     </div>
                  </div>
                ) : (
                  calculation.notes && (
                    <div className="text-sm text-engineering-600">
                      <span className="font-medium">Notes: </span>
                      {calculation.notes}
                    </div>
                  )
                )}
                                               </div>
              </SlideIn>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </div>
  )
}