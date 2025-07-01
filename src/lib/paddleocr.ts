import * as ort from 'onnxruntime-web'

export interface PaddleOCRResult {
  text: string
  confidence: number
  expression: string | null
  result: number | null
  boxes: number[][]
}

interface DetectionResult {
  boxes: number[][]
}

interface RecognitionResult {
  text: string
  confidence: number
}

class PaddleOCRService {
  private detectionSession: ort.InferenceSession | null = null
  private recognitionSession: ort.InferenceSession | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      // Configure ONNX Runtime for web
      ort.env.wasm.wasmPaths = '/onnx/'
      ort.env.wasm.numThreads = 1

      // Load detection model (text detection)
      console.log('Loading PaddleOCR detection model...')
      this.detectionSession = await ort.InferenceSession.create('/models/ch_PP-OCRv4_det_infer.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      })

      // Load recognition model (text recognition)
      console.log('Loading PaddleOCR recognition model...')
      this.recognitionSession = await ort.InferenceSession.create('/models/ch_PP-OCRv4_rec_infer.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      })

      this.isInitialized = true
      console.log('PaddleOCR models loaded successfully')
    } catch (error) {
      console.error('Failed to initialize PaddleOCR:', error)
      throw error
    }
  }

  async processImage(imageData: string | File): Promise<PaddleOCRResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Convert image to tensor
      const imageTensor = await this.imageToTensor(imageData)
      
      // Step 1: Text Detection
      const detectionResult = await this.detectText(imageTensor)
      
      // Step 2: Text Recognition for each detected region
      const recognitionResults = await this.recognizeText(imageData, detectionResult.boxes)
      
      // Combine results
      const combinedText = recognitionResults.map(r => r.text).join(' ')
      const avgConfidence = recognitionResults.reduce((sum, r) => sum + r.confidence, 0) / recognitionResults.length
      
      // Extract mathematical expression and calculate result
      const expression = this.extractMathExpression(combinedText)
      const result = expression ? this.evaluateExpression(expression) : null

      return {
        text: combinedText,
        confidence: avgConfidence,
        expression,
        result,
        boxes: detectionResult.boxes
      }
    } catch (error) {
      console.error('PaddleOCR processing failed:', error)
      return {
        text: '',
        confidence: 0,
        expression: null,
        result: null,
        boxes: []
      }
    }
  }

  private async imageToTensor(imageData: string | File): Promise<ort.Tensor> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          
          // Resize image to model input size (typically 640x640 for PaddleOCR)
          const targetSize = 640
          canvas.width = targetSize
          canvas.height = targetSize
          
          // Draw and resize image
          ctx.drawImage(img, 0, 0, targetSize, targetSize)
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, targetSize, targetSize)
          const { data } = imageData
          
          // Convert RGBA to RGB and normalize
          const rgbData = new Float32Array(3 * targetSize * targetSize)
          for (let i = 0; i < targetSize * targetSize; i++) {
            rgbData[i] = (data[i * 4] / 255.0 - 0.485) / 0.229 // R channel
            rgbData[i + targetSize * targetSize] = (data[i * 4 + 1] / 255.0 - 0.456) / 0.224 // G channel
            rgbData[i + 2 * targetSize * targetSize] = (data[i * 4 + 2] / 255.0 - 0.406) / 0.225 // B channel
          }
          
          // Create tensor
          const tensor = new ort.Tensor('float32', rgbData, [1, 3, targetSize, targetSize])
          resolve(tensor)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = reject
      
      if (typeof imageData === 'string') {
        img.src = imageData
      } else {
        const reader = new FileReader()
        reader.onload = () => img.src = reader.result as string
        reader.readAsDataURL(imageData)
      }
    })
  }

  private async detectText(imageTensor: ort.Tensor): Promise<DetectionResult> {
    if (!this.detectionSession) {
      throw new Error('Detection model not loaded')
    }

    try {
      const feeds = { x: imageTensor }
      const results = await this.detectionSession.run(feeds)
      
      // Process detection results to extract bounding boxes
      const output = results[Object.keys(results)[0]]
      const boxes = this.processDetectionOutput(output)
      
      return { boxes }
    } catch (error) {
      console.error('Text detection failed:', error)
      return { boxes: [] }
    }
  }

  private processDetectionOutput(output: ort.Tensor): number[][] {
    // This is a simplified version - actual implementation would need
    // to properly decode the PaddleOCR detection output format
    const data = output.data as Float32Array
    const boxes: number[][] = []
    
    // For demo purposes, return a mock bounding box
    // In real implementation, you'd decode the actual detection results
    if (data.length > 0) {
      boxes.push([50, 50, 300, 100]) // [x, y, width, height]
    }
    
    return boxes
  }

  private async recognizeText(imageData: string | File, boxes: number[][]): Promise<RecognitionResult[]> {
    if (!this.recognitionSession || boxes.length === 0) {
      return []
    }

    const results: RecognitionResult[] = []
    
    try {
      // For each detected text region, extract and recognize
      for (const box of boxes) {
        const regionTensor = await this.extractTextRegion(imageData, box)
        const feeds = { x: regionTensor }
        const output = await this.recognitionSession.run(feeds)
        
        // Process recognition output
        const recognitionResult = this.processRecognitionOutput(output)
        results.push(recognitionResult)
      }
    } catch (error) {
      console.error('Text recognition failed:', error)
    }
    
    return results
  }

  private async extractTextRegion(imageData: string | File, box: number[]): Promise<ort.Tensor> {
    // Extract the text region from the image based on bounding box
    // This is a simplified implementation
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          
          // Set canvas size to recognition model input (typically 32x320 for PaddleOCR)
          canvas.width = 320
          canvas.height = 32
          
          // Extract and resize the region
          const [x, y, width, height] = box
          ctx.drawImage(img, x, y, width, height, 0, 0, 320, 32)
          
          // Convert to tensor (similar to imageToTensor but for recognition input size)
          const imageData = ctx.getImageData(0, 0, 320, 32)
          const { data } = imageData
          
          const rgbData = new Float32Array(3 * 320 * 32)
          for (let i = 0; i < 320 * 32; i++) {
            rgbData[i] = (data[i * 4] / 255.0 - 0.5) / 0.5 // R channel
            rgbData[i + 320 * 32] = (data[i * 4 + 1] / 255.0 - 0.5) / 0.5 // G channel
            rgbData[i + 2 * 320 * 32] = (data[i * 4 + 2] / 255.0 - 0.5) / 0.5 // B channel
          }
          
          const tensor = new ort.Tensor('float32', rgbData, [1, 3, 32, 320])
          resolve(tensor)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = reject
      
      if (typeof imageData === 'string') {
        img.src = imageData
      } else {
        const reader = new FileReader()
        reader.onload = () => img.src = reader.result as string
        reader.readAsDataURL(imageData)
      }
    })
  }

  private processRecognitionOutput(output: { [key: string]: ort.Tensor }): RecognitionResult {
    // Process the recognition model output
    // This is a simplified version - actual implementation would decode
    // the character predictions using the PaddleOCR dictionary
    
    const outputTensor = output[Object.keys(output)[0]]
    const data = outputTensor.data as Float32Array
    
    // For demo purposes, return mock result
    // In real implementation, you'd decode the character sequence
    return {
      text: this.mockRecognitionDecode(data),
      confidence: 0.85 // Mock confidence
    }
  }

  private mockRecognitionDecode(data: Float32Array): string {
    // This is a placeholder - real implementation would use
    // the PaddleOCR character dictionary to decode the output
    const mockTexts = [
      '2 + 3 = 5',
      '10 × 4 = 40',
      '15 ÷ 3 = 5',
      '7 - 2 = 5',
      '3.14 × 2 = 6.28'
    ]
    
    return mockTexts[Math.floor(Math.random() * mockTexts.length)]
  }

  private extractMathExpression(text: string): string | null {
    // Enhanced mathematical expression extraction
    const cleanedText = text
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, ' ')
      .trim()

    // Look for mathematical expressions
    const patterns = [
      /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)\s*=?\s*(\d+(?:\.\d+)?)?/,
      /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/,
      /(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/
    ]

    for (const pattern of patterns) {
      const match = cleanedText.match(pattern)
      if (match) {
        if (match[4]) {
          return `${match[1]} ${match[2]} ${match[3]}`
        } else if (match[3]) {
          return `${match[1]} ${match[2]} ${match[3]}`
        }
      }
    }

    return null
  }

  private evaluateExpression(expression: string): number | null {
    try {
      // Basic safety check
      if (!/^[\d+\-*/.() ]+$/.test(expression)) {
        return null
      }

      const result = Function(`"use strict"; return (${expression})`)()
      return typeof result === 'number' && !isNaN(result) ? Math.round(result * 100) / 100 : null
    } catch {
      return null
    }
  }

  async cleanup() {
    if (this.detectionSession) {
      await this.detectionSession.release()
      this.detectionSession = null
    }
    if (this.recognitionSession) {
      await this.recognitionSession.release()
      this.recognitionSession = null
    }
    this.isInitialized = false
  }
}

export const paddleOCRService = new PaddleOCRService()