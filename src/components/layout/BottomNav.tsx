import React from 'react'
import { Camera, History, PenTool, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SlideIn } from '@/components/ui/slide-in'
import { MagneticEffect } from '@/components/ui/magnetic-effect'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  currentView: 'camera' | 'history' | 'whiteboard' | 'ai-assistant'
  onViewChange: (view: 'camera' | 'history' | 'whiteboard' | 'ai-assistant') => void
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
                "flex flex-col items-center space-y-1 py-2 px-3 transition-all duration-200",
                currentView === 'camera' ? "text-engineering-600 scale-110" : "text-engineering-400"
              )}
            >
              <Camera className="w-5 h-5" />
              <span className="text-xs font-medium">Camera</span>
            </Button>
          </MagneticEffect>
          
          <MagneticEffect>
            <Button
              variant="ghost"
              onClick={() => onViewChange('whiteboard')}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-3 transition-all duration-200",
                currentView === 'whiteboard' ? "text-engineering-600 scale-110" : "text-engineering-400"
              )}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-xs font-medium">Whiteboard</span>
            </Button>
          </MagneticEffect>
          
          <MagneticEffect>
            <Button
              variant="ghost"
              onClick={() => onViewChange('ai-assistant')}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-3 transition-all duration-200",
                currentView === 'ai-assistant' ? "text-engineering-600 scale-110" : "text-engineering-400"
              )}
            >
              <Bot className="w-5 h-5" />
              <span className="text-xs font-medium">AI Assistant</span>
            </Button>
          </MagneticEffect>

          <MagneticEffect>
            <Button
              variant="ghost"
              onClick={() => onViewChange('history')}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-3 transition-all duration-200",
                currentView === 'history' ? "text-engineering-600 scale-110" : "text-engineering-400"
              )}
            >
              <History className="w-5 h-5" />
              <span className="text-xs font-medium">History</span>
            </Button>
          </MagneticEffect>
        </div>
      </nav>
    </SlideIn>
  )
}