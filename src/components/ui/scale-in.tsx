import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  scale?: number
  className?: string
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.4, 
  scale = 0.8,
  className = '' 
}: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ scale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 120,
        damping: 15
      }}
    >
      {children}
    </motion.div>
  )
}