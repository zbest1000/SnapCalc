import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
  expression: string | null
  result: number | null
}

class OCRService {
  private worker: Tesseract.Worker | null = null

  async initialize() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log(m)
      })
      
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789+-*/=.()×÷√^',
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      })
    }
    return this.worker
  }

  async processImage(imageData: string | File): Promise<OCRResult> {
    const worker = await this.initialize()
    
    try {
      const { data } = await worker.recognize(imageData)
      
      const cleanedText = this.cleanOCRText(data.text)
      const expression = this.extractMathExpression(cleanedText)
      const result = expression ? this.evaluateExpression(expression) : null
      
      return {
        text: cleanedText,
        confidence: data.confidence,
        expression,
        result,
      }
    } catch (error) {
      console.error('OCR processing failed:', error)
      return {
        text: '',
        confidence: 0,
        expression: null,
        result: null,
      }
    }
  }

  private cleanOCRText(text: string): string {
    return text
      .replace(/[^\d+\-*/=.()×÷√^\s]/g, '') // Keep only math characters
      .replace(/×/g, '*') // Convert multiplication symbol
      .replace(/÷/g, '/') // Convert division symbol
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
  }

  private extractMathExpression(text: string): string | null {
    // Look for mathematical expressions patterns
    const patterns = [
      /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)\s*=?\s*(\d+(?:\.\d+)?)?/,
      /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/,
      /(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        if (match[4]) {
          // Expression with result
          return `${match[1]} ${match[2]} ${match[3]}`
        } else if (match[3]) {
          // Expression without result
          return `${match[1]} ${match[2]} ${match[3]}`
        }
      }
    }

    return null
  }

  private evaluateExpression(expression: string): number | null {
    try {
      // Basic safety check - only allow numbers and basic operators
      if (!/^[\d+\-*/.() ]+$/.test(expression)) {
        return null
      }

      // Use Function constructor for safe evaluation
      const result = Function(`"use strict"; return (${expression})`)()
      
      return typeof result === 'number' && !isNaN(result) ? Math.round(result * 100) / 100 : null
    } catch {
      return null
    }
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}

export const ocrService = new OCRService()