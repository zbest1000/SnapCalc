import React from 'react'
import { Calculator, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-engineering-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-engineering-500 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-engineering-900">SnapCalc</h1>
          </div>
        </div>
        
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5 text-engineering-600" />
        </Button>
      </div>
    </header>
  )
}