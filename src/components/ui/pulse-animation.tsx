import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PulseAnimationProps {
  children: ReactNode
  duration?: number
  scale?: number
  className?: string
}

export function PulseAnimation({ 
  children, 
  duration = 2,
  scale = 1.05,
  className = '' 
}: PulseAnimationProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}