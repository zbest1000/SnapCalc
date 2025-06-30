'use client'

import { useState } from 'react'
import { Camera } from '@/components/camera/Camera'
import { CalculationHistory } from '@/components/calculation/CalculationHistory'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { WelcomeScreen } from '@/components/welcome/WelcomeScreen'
import { useCalculationStore } from '@/lib/store'

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'welcome' | 'camera' | 'history'>('welcome')
  const { calculations } = useCalculationStore()

  const handleGetStarted = () => {
    setCurrentView('camera')
  }

  const renderContent = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />
      case 'camera':
        return <Camera />
      case 'history':
        return <CalculationHistory calculations={calculations} />
      default:
        return <WelcomeScreen onGetStarted={handleGetStarted} />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-engineering-50 to-engineering-100">
      {currentView !== 'welcome' && <Header />}
      
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {currentView !== 'welcome' && (
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      )}
    </div>
  )
}