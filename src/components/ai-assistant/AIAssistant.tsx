'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Calculator, Lightbulb, BookOpen, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/fade-in'
import { SlideIn } from '@/components/ui/slide-in'
import { AIEngineeringAssistant } from '@/lib/ai-engineering-assistant'
import { AIRecommendation, EngineeringQuery, EngineeringCategory } from '@/types/engineering'
import { RecommendationCard } from './RecommendationCard'
import { FormulaCalculator } from './FormulaCalculator'
import { QuickActions } from './QuickActions'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  recommendations?: AIRecommendation[]
  timestamp: Date
}

interface AIAssistantProps {
  onCalculationSave?: (calculation: any) => void
}

export function AIAssistant({ onCalculationSave }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiAssistant] = useState(() => new AIEngineeringAssistant())
  const [selectedCategory, setSelectedCategory] = useState<EngineeringCategory | 'all'>('all')
  const [showCalculator, setShowCalculator] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: crypto.randomUUID(),
      type: 'assistant',
      content: "Hi! I'm your AI Engineering Assistant. I can help you with calculations, formulas, and unit conversions across mechanical, electrical, structural, and other engineering disciplines. Try asking me something like:\n\n• \"Convert 1800 RPM to feet per minute with 6 inch pulley\"\n• \"Calculate motor power from torque and RPM\"\n• \"What's the flow rate in a 4 inch pipe?\"\n• \"How do I calculate belt ratios?\"",
      timestamp: new Date()
    }])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const query: EngineeringQuery = {
        query: input.trim(),
        context: {
          preferredUnits: 'metric', // Could be configurable
          complexity: 'intermediate'
        }
      }

      const recommendations = await aiAssistant.analyzeQuery(query)
      
      let responseContent = ''
      if (recommendations.length > 0) {
        responseContent = `I found ${recommendations.length} relevant suggestions for your question. Here are the best matches:`
      } else {
        responseContent = "I couldn't find specific formulas for your question, but I can help you with general engineering calculations. Try asking about specific topics like motors, power, flow rates, or structural calculations."
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: responseContent,
        recommendations,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error analyzing query:', error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: "I encountered an error while analyzing your question. Please try rephrasing it or ask about a specific engineering calculation.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (query: string) => {
    setInput(query)
    // Auto-submit the quick action
    const event = { preventDefault: () => {} } as React.FormEvent
    await handleSubmit(event)
  }

  const handleRecommendationSelect = (recommendation: AIRecommendation) => {
    setSelectedRecommendation(recommendation)
    if (recommendation.type === 'formula' && recommendation.formula) {
      setShowCalculator(true)
    }
  }

  const categories: { value: EngineeringCategory | 'all', label: string, icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Bot className="w-4 h-4" /> },
    { value: 'mechanical', label: 'Mechanical', icon: <Settings className="w-4 h-4" /> },
    { value: 'electrical', label: 'Electrical', icon: <Zap className="w-4 h-4" /> },
    { value: 'structural', label: 'Structural', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'fluid_dynamics', label: 'Fluids', icon: <Calculator className="w-4 h-4" /> }
  ]

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-engineering-50 to-engineering-100">
      {/* Header */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-b border-engineering-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-engineering-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-engineering-900">AI Engineering Assistant</h1>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'engineering' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className="flex items-center space-x-1 whitespace-nowrap"
            >
              {category.icon}
              <span>{category.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <FadeIn key={message.id} delay={index * 0.1}>
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.type === 'user' ? 'bg-engineering-500 text-white' : 'bg-white/80 text-engineering-900'} rounded-lg p-4 shadow-sm`}>
                <div className="flex items-start space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-white/20' : 'bg-engineering-100'}`}>
                    {message.type === 'user' ? 
                      <User className="w-4 h-4" /> : 
                      <Bot className="w-4 h-4 text-engineering-600" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    
                    {/* Recommendations */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.recommendations.map(recommendation => (
                          <RecommendationCard
                            key={recommendation.id}
                            recommendation={recommendation}
                            onSelect={() => handleRecommendationSelect(recommendation)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/80 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-engineering-600 animate-pulse" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-engineering-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-engineering-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-engineering-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <QuickActions onActionSelect={handleQuickAction} />

      {/* Input */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-engineering-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about engineering calculations..."
            className="flex-1 px-4 py-2 border border-engineering-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-engineering-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} variant="engineering">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Formula Calculator Modal */}
      {showCalculator && selectedRecommendation?.formula && (
        <FormulaCalculator
          formula={selectedRecommendation.formula}
          onClose={() => {
            setShowCalculator(false)
            setSelectedRecommendation(null)
          }}
          onCalculationSave={onCalculationSave}
        />
      )}
    </div>
  )
}