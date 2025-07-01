import React from 'react'
import { Camera, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SlideIn } from '@/components/ui/slide-in'
import { MagneticEffect } from '@/components/ui/magnetic-effect'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  currentView: 'camera' | 'history'
  onViewChange: (view: 'camera' | 'history') => void
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <SlideIn direction="up" duration={0.4}>
      <nav className="bg-white/90 backdrop-blur-sm border-t border-engineering-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <MagneticEffect>
            <Button
              variant="ghost"
              onClick={() => onViewChange('camera')}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-4 transition-all duration-200",
                currentView === 'camera' ? "text-engineering-600 scale-110" : "text-engineering-400"
              )}
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">Camera</span>
            </Button>
          </MagneticEffect>
          
          <MagneticEffect>
            <Button
              variant="ghost"
              onClick={() => onViewChange('history')}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-4 transition-all duration-200",
                currentView === 'history' ? "text-engineering-600 scale-110" : "text-engineering-400"
              )}
            >
              <History className="w-6 h-6" />
              <span className="text-xs font-medium">History</span>
            </Button>
          </MagneticEffect>
        </div>
      </nav>
    </SlideIn>
  )
}