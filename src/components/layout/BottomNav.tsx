import React from 'react'
import { Camera, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  currentView: 'camera' | 'history'
  onViewChange: (view: 'camera' | 'history') => void
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="bg-white/90 backdrop-blur-sm border-t border-engineering-200 px-4 py-2">
      <div className="flex items-center justify-around">
        <Button
          variant="ghost"
          onClick={() => onViewChange('camera')}
          className={cn(
            "flex flex-col items-center space-y-1 py-2 px-4",
            currentView === 'camera' ? "text-engineering-600" : "text-engineering-400"
          )}
        >
          <Camera className="w-6 h-6" />
          <span className="text-xs font-medium">Camera</span>
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => onViewChange('history')}
          className={cn(
            "flex flex-col items-center space-y-1 py-2 px-4",
            currentView === 'history' ? "text-engineering-600" : "text-engineering-400"
          )}
        >
          <History className="w-6 h-6" />
          <span className="text-xs font-medium">History</span>
        </Button>
      </div>
    </nav>
  )
}