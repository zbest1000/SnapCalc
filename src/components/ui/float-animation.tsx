import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FloatAnimationProps {
  children: ReactNode
  duration?: number
  intensity?: number
  className?: string
}

export function FloatAnimation({ 
  children, 
  duration = 3,
  intensity = 10,
  className = '' 
}: FloatAnimationProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-intensity, intensity, -intensity],
        rotate: [-1, 1, -1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "reverse"
      }}
    >
      {children}
    </motion.div>
  )
}