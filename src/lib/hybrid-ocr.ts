import { ocrService } from './ocr'
import { paddleOCRService, PaddleOCRResult } from './paddleocr'

export interface HybridOCRResult {
  text: string
  confidence: number
  expression: string | null
  result: number | null
  engine: 'paddleocr' | 'tesseract'
  boxes?: number[][]
}

class HybridOCRService {
  private preferredEngine: 'paddleocr' | 'tesseract' = 'paddleocr'
  private paddleOCRAvailable = false

  async initialize() {
    try {
      // Try to initialize PaddleOCR first
      await paddleOCRService.initialize()
      this.paddleOCRAvailable = true
      console.log('PaddleOCR initialized successfully')
    } catch (error) {
      console.warn('PaddleOCR initialization failed, falling back to Tesseract.js:', error)
      this.paddleOCRAvailable = false
      this.preferredEngine = 'tesseract'
    }

    // Initialize Tesseract.js as fallback
    try {
      await ocrService.initialize()
      console.log('Tesseract.js initialized successfully')
    } catch (error) {
      console.error('Both OCR engines failed to initialize:', error)
      throw new Error('No OCR engine available')
    }
  }

  async processImage(imageData: string | File): Promise<HybridOCRResult> {
    // Try PaddleOCR first if available
    if (this.paddleOCRAvailable && this.preferredEngine === 'paddleocr') {
      try {
                 const result = await this.processWithPaddleOCR(imageData)
        if (result.confidence > 0.7) { // Good confidence threshold
          return {
            ...result,
            engine: 'paddleocr'
          }
        }
        console.log('PaddleOCR confidence too low, trying Tesseract.js fallback')
      } catch (error) {
        console.warn('PaddleOCR processing failed, falling back to Tesseract.js:', error)
      }
    }

    // Fallback to Tesseract.js
    try {
      const result = await this.processWithTesseract(imageData)
      return {
        ...result,
        engine: 'tesseract'
      }
    } catch (error) {
      console.error('All OCR engines failed:', error)
      throw new Error('OCR processing failed with all engines')
    }
  }

  private async processWithPaddleOCR(imageData: string | File): Promise<PaddleOCRResult> {
    return await paddleOCRService.processImage(imageData)
  }

  private async processWithTesseract(imageData: string | File): Promise<HybridOCRResult> {
    const result = await ocrService.processImage(imageData)
    return {
      text: result.text,
      confidence: result.confidence,
      expression: result.expression,
      result: result.result,
      engine: 'tesseract'
    }
  }

  async processWithBothEngines(imageData: string | File): Promise<{
    paddleocr?: HybridOCRResult
    tesseract: HybridOCRResult
    recommended: HybridOCRResult
  }> {
    const results: any = {}

    // Try PaddleOCR
    if (this.paddleOCRAvailable) {
      try {
                 const paddleResult = await this.processWithPaddleOCR(imageData)
        results.paddleocr = {
          ...paddleResult,
          engine: 'paddleocr' as const
        }
      } catch (error) {
        console.warn('PaddleOCR failed:', error)
      }
    }

    // Try Tesseract.js
    try {
      results.tesseract = await this.processWithTesseract(imageData)
    } catch (error) {
      console.error('Tesseract.js failed:', error)
      throw new Error('All OCR engines failed')
    }

    // Determine recommended result
    let recommended = results.tesseract
    if (results.paddleocr && results.paddleocr.confidence > results.tesseract.confidence) {
      recommended = results.paddleocr
    }

    return {
      ...results,
      recommended
    }
  }

  setPreferredEngine(engine: 'paddleocr' | 'tesseract') {
    this.preferredEngine = engine
  }

  getAvailableEngines(): string[] {
    const engines = ['tesseract']
    if (this.paddleOCRAvailable) {
      engines.unshift('paddleocr')
    }
    return engines
  }

  async cleanup() {
    await Promise.all([
      paddleOCRService.cleanup(),
      ocrService.cleanup()
    ])
  }
}

export const hybridOCRService = new HybridOCRService()