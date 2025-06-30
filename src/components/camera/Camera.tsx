'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera as CameraIcon, FlashOff, RotateCcw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCalculationStore } from '@/lib/store'
import { ocrService } from '@/lib/ocr'

export function Camera() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { addCalculation, setProcessing } = useCalculationStore()

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setHasPermission(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageDataUrl)
    setIsCapturing(true)
    stopCamera()
  }, [stopCamera])

  const processImage = useCallback(async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    setProcessing(true)

    try {
      const result = await ocrService.processImage(capturedImage)
      
      addCalculation({
        image: capturedImage,
        ocrText: result.text,
        result: result.result,
        expression: result.expression || result.text,
        confidence: result.confidence,
        verified: false,
        tags: [],
        notes: ''
      })

      // Reset state
      setCapturedImage(null)
      setIsCapturing(false)
      startCamera() // Restart camera for next capture
      
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsProcessing(false)
      setProcessing(false)
    }
  }, [capturedImage, addCalculation, setProcessing, startCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setIsCapturing(false)
    startCamera()
  }, [startCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCapturedImage(imageDataUrl)
      setIsCapturing(true)
      stopCamera()
    }
    reader.readAsDataURL(file)
  }, [stopCamera])

  React.useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <CameraIcon className="w-16 h-16 text-engineering-400 mb-4" />
        <h2 className="text-xl font-semibold text-engineering-900 mb-2">Camera Access Required</h2>
        <p className="text-engineering-600 mb-6">
          SnapCalc needs camera access to capture calculation images.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <Button onClick={startCamera} variant="engineering" className="w-full">
            Enable Camera
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="w-full"
          >
            Upload Image Instead
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    )
  }

  if (isCapturing && capturedImage) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 relative">
          <img 
            src={capturedImage} 
            alt="Captured calculation" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 scan-animation" />
        </div>
        
        <div className="p-4 bg-white/90 backdrop-blur-sm">
          <div className="flex space-x-3">
            <Button 
              onClick={retakePhoto} 
              variant="outline" 
              className="flex-1"
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button 
              onClick={processImage} 
              variant="engineering" 
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Process
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="engineering-grid w-full h-full opacity-30" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-40 border-2 border-engineering-400 rounded-lg bg-engineering-400/10" />
          </div>
        </div>

        {/* Top controls */}
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" className="bg-black/50 text-white">
            <FlashOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="p-6 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-8">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="ghost" 
            size="icon"
            className="w-12 h-12"
          >
            <RotateCcw className="w-6 h-6 text-engineering-600" />
          </Button>
          
          <Button
            onClick={capturePhoto}
            variant="engineering"
            size="icon"
            className="w-16 h-16 rounded-full"
          >
            <CameraIcon className="w-8 h-8" />
          </Button>
          
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>
        
        <p className="text-center text-sm text-engineering-600 mt-4">
          Position calculator display within the frame
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  )
}