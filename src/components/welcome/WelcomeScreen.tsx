import React from 'react'
import { Camera, Calculator, Zap, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/fade-in'
import { SlideIn } from '@/components/ui/slide-in'
import { ScaleIn } from '@/components/ui/scale-in'
import { StaggerContainer } from '@/components/ui/stagger-container'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { MagneticEffect } from '@/components/ui/magnetic-effect'

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
        <ScaleIn delay={0.2}>
          <div className="w-20 h-20 bg-engineering-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-10 h-10 text-white" />
          </div>
        </ScaleIn>
        <FadeIn delay={0.4} direction="up">
          <h1 className="text-3xl font-bold text-engineering-900 mb-2">SnapCalc</h1>
        </FadeIn>
        <FadeIn delay={0.6} direction="up">
          <TypingAnimation 
            text="Mobile calc logger via photo + OCR" 
            className="text-engineering-700 text-lg"
            delay={0.8}
            speed={80}
          />
        </FadeIn>
        <FadeIn delay={1.8} direction="up">
          <p className="text-engineering-600 text-sm mt-1">For field engineers</p>
        </FadeIn>
      </div>

      {/* Features Grid */}
      <div className="flex-1 px-6">
        <StaggerContainer delay={1.0} staggerDelay={0.15}>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-engineering-200 hover:shadow-lg transition-shadow duration-300">
                <ScaleIn delay={0.1 * index}>
                  <feature.icon className="w-8 h-8 text-engineering-500 mb-2" />
                </ScaleIn>
                <h3 className="font-semibold text-engineering-900 text-sm mb-1">{feature.title}</h3>
                <p className="text-engineering-600 text-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </StaggerContainer>

        {/* Key Benefits */}
        <SlideIn delay={1.5} direction="up">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-engineering-200 mb-8">
            <h3 className="font-semibold text-engineering-900 mb-3">Professional Engineering Tool</h3>
            <StaggerContainer delay={0.2} staggerDelay={0.1}>
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
            </StaggerContainer>
          </div>
        </SlideIn>
      </div>

      {/* CTA Button */}
      <div className="p-6">
        <MagneticEffect className="w-full">
          <FadeIn delay={2.0} direction="up">
            <Button 
              onClick={onGetStarted}
              variant="engineering"
              size="lg"
              className="w-full text-lg font-semibold hover:scale-105 transition-transform duration-200"
            >
              Get Started
            </Button>
          </FadeIn>
        </MagneticEffect>
        <FadeIn delay={2.2} direction="up">
          <p className="text-center text-xs text-engineering-600 mt-2">
            No account required • Works offline
          </p>
        </FadeIn>
      </div>
    </div>
  )
}