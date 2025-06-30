import React from 'react'
import { Camera, Calculator, Zap, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const features = [
    {
      icon: Camera,
      title: 'Photo Capture',
      description: 'Snap photos of calculations instantly'
    },
    {
      icon: Zap,
      title: 'AI-Powered OCR',
      description: 'Advanced text recognition for calculations'
    },
    {
      icon: Calculator,
      title: 'Smart Processing',
      description: 'Automatic calculation verification'
    },
    {
      icon: CheckCircle,
      title: 'Field Ready',
      description: 'Built for engineering professionals'
    }
  ]

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-engineering-50 to-engineering-100">
      {/* Header */}
      <div className="text-center pt-12 pb-8">
        <div className="w-20 h-20 bg-engineering-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-engineering-900 mb-2">SnapCalc</h1>
        <p className="text-engineering-700 text-lg">Mobile calc logger via photo + OCR</p>
        <p className="text-engineering-600 text-sm mt-1">For field engineers</p>
      </div>

      {/* Features Grid */}
      <div className="flex-1 px-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-engineering-200">
              <feature.icon className="w-8 h-8 text-engineering-500 mb-2" />
              <h3 className="font-semibold text-engineering-900 text-sm mb-1">{feature.title}</h3>
              <p className="text-engineering-600 text-xs">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Key Benefits */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-engineering-200 mb-8">
          <h3 className="font-semibold text-engineering-900 mb-3">Professional Engineering Tool</h3>
          <ul className="space-y-2 text-sm text-engineering-700">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-engineering-500 mr-2 flex-shrink-0" />
              Real-time calculation verification
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-engineering-500 mr-2 flex-shrink-0" />
              Offline-capable for field work
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-engineering-500 mr-2 flex-shrink-0" />
              Export data for documentation
            </li>
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6">
        <Button 
          onClick={onGetStarted}
          variant="engineering"
          size="lg"
          className="w-full text-lg font-semibold"
        >
          Get Started
        </Button>
        <p className="text-center text-xs text-engineering-600 mt-2">
          No account required • Works offline
        </p>
      </div>
    </div>
  )
}