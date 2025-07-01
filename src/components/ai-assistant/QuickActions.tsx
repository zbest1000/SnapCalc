'use client'

import React from 'react'
import { Settings, Zap, Calculator, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  onActionSelect: (query: string) => void
}

export function QuickActions({ onActionSelect }: QuickActionsProps) {
  const actions = [
    {
      icon: <Settings className="w-4 h-4" />,
      label: 'RPM to FPM',
      query: 'Convert 1800 RPM to feet per minute with 6 inch pulley',
      category: 'mechanical'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Motor Power',
      query: 'Calculate motor power from 100 lb-ft torque at 1800 RPM',
      category: 'mechanical'
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: 'Electrical Power',
      query: 'Calculate electrical power from 120V and 10A current',
      category: 'electrical'
    },
    {
      icon: <Calculator className="w-4 h-4" />,
      label: 'Belt Ratio',
      query: 'Calculate belt ratio for 6 inch drive pulley and 12 inch driven pulley',
      category: 'mechanical'
    }
  ]

  return (
    <div className="px-4 py-2 bg-white/90 backdrop-blur-sm border-t border-engineering-200">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs font-medium text-engineering-600">Quick Actions:</span>
      </div>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onActionSelect(action.query)}
            className="flex items-center space-x-1 whitespace-nowrap text-xs"
          >
            {action.icon}
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}