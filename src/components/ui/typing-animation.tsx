import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface TypingAnimationProps {
  text: string
  delay?: number
  speed?: number
  className?: string
  showCursor?: boolean
}

export function TypingAnimation({ 
  text, 
  delay = 0, 
  speed = 50,
  className = '',
  showCursor = true
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true)
    }, delay * 1000)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed, started])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ 
            duration: 1, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="ml-1"
        >
          |
        </motion.span>
      )}
    </span>
  )
}