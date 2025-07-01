# PaddleOCR Integration Setup Guide

This guide explains how to set up PaddleOCR models in SnapCalc for enhanced OCR accuracy, especially for mathematical expressions and calculator displays.

## Overview

SnapCalc now supports two OCR engines:
1. **PaddleOCR** (Primary) - Higher accuracy, especially for mathematical text
2. **Tesseract.js** (Fallback) - Reliable backup option

The hybrid system automatically falls back to Tesseract.js if PaddleOCR is unavailable or produces low-confidence results.

## Model Setup

### 1. Download PaddleOCR Models

You need to download the ONNX versions of PaddleOCR models:

#### Required Models:
- **Detection Model**: `ch_PP-OCRv4_det_infer.onnx` (~2.3MB)
- **Recognition Model**: `ch_PP-OCRv4_rec_infer.onnx` (~8.5MB)
- **Dictionary**: `ppocr_keys_v1.txt` (~40KB)

#### Download Sources:

**Option 1: Official PaddleOCR Models (Recommended)**
```bash
# Create models directory
mkdir -p public/models
mkdir -p public/onnx

# Download detection model
wget https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_det_infer.tar -O /tmp/det.tar
tar -xf /tmp/det.tar -C /tmp/
# Convert to ONNX (requires paddle2onnx)
paddle2onnx --model_dir /tmp/ch_PP-OCRv4_det_infer --model_filename inference.pdmodel --params_filename inference.pdiparams --save_file public/models/ch_PP-OCRv4_det_infer.onnx

# Download recognition model
wget https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_infer.tar -O /tmp/rec.tar
tar -xf /tmp/rec.tar -C /tmp/
paddle2onnx --model_dir /tmp/ch_PP-OCRv4_rec_infer --model_filename inference.pdmodel --params_filename inference.pdiparams --save_file public/models/ch_PP-OCRv4_rec_infer.onnx

# Download dictionary
wget https://raw.githubusercontent.com/PaddlePaddle/PaddleOCR/release/2.7/ppocr/utils/ppocr_keys_v1.txt -O public/models/ppocr_keys_v1.txt
```

**Option 2: Pre-converted ONNX Models**
```bash
# Download from community sources (if available)
wget https://example.com/paddleocr-onnx/ch_PP-OCRv4_det_infer.onnx -O public/models/ch_PP-OCRv4_det_infer.onnx
wget https://example.com/paddleocr-onnx/ch_PP-OCRv4_rec_infer.onnx -O public/models/ch_PP-OCRv4_rec_infer.onnx
wget https://example.com/paddleocr-onnx/ppocr_keys_v1.txt -O public/models/ppocr_keys_v1.txt
```

### 2. Download ONNX Runtime WASM Files

```bash
# Download ONNX Runtime WASM files
mkdir -p public/onnx
cd public/onnx

# Download required WASM files (version 1.16.3)
wget https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm.wasm
wget https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm-simd.wasm
wget https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm-threaded.wasm
wget https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-training-wasm-simd.wasm
```

### 3. Directory Structure

After setup, your `public` directory should look like:

```
public/
├── models/
│   ├── ch_PP-OCRv4_det_infer.onnx
│   ├── ch_PP-OCRv4_rec_infer.onnx
│   └── ppocr_keys_v1.txt
├── onnx/
│   ├── ort-wasm.wasm
│   ├── ort-wasm-simd.wasm
│   ├── ort-wasm-threaded.wasm
│   └── ort-training-wasm-simd.wasm
├── icon-192x192.png
├── icon-512x512.png
└── manifest.json
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# OCR Configuration
NEXT_PUBLIC_OCR_ENGINE=hybrid
NEXT_PUBLIC_PADDLEOCR_DETECTION_MODEL=/models/ch_PP-OCRv4_det_infer.onnx
NEXT_PUBLIC_PADDLEOCR_RECOGNITION_MODEL=/models/ch_PP-OCRv4_rec_infer.onnx
NEXT_PUBLIC_PADDLEOCR_DICTIONARY=/models/ppocr_keys_v1.txt

# Performance Settings
NEXT_PUBLIC_OCR_CONFIDENCE_THRESHOLD=0.7
NEXT_PUBLIC_OCR_PREFERRED_ENGINE=paddleocr
```

### Next.js Configuration

Update `next.config.js` to serve WASM files:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/onnx/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  },
}
```

## Usage

### Basic Usage

The hybrid OCR service is automatically used in the camera component:

```typescript
import { hybridOCRService } from '@/lib/hybrid-ocr'

// Initialize (happens automatically)
await hybridOCRService.initialize()

// Process image
const result = await hybridOCRService.processImage(imageData)
console.log(`Detected text: ${result.text}`)
console.log(`Used engine: ${result.engine}`)
console.log(`Confidence: ${result.confidence}`)
```

### Advanced Usage

Compare results from both engines:

```typescript
const comparison = await hybridOCRService.processWithBothEngines(imageData)

console.log('PaddleOCR result:', comparison.paddleocr)
console.log('Tesseract result:', comparison.tesseract)
console.log('Recommended result:', comparison.recommended)
```

Set preferred engine:

```typescript
// Prefer PaddleOCR (default)
hybridOCRService.setPreferredEngine('paddleocr')

// Prefer Tesseract.js
hybridOCRService.setPreferredEngine('tesseract')
```

## Performance Optimization

### Model Size Optimization

1. **Use quantized models** for smaller file sizes:
   ```bash
   # Convert to INT8 quantized ONNX (requires onnxruntime-tools)
   python -m onnxruntime.quantization.quantize_dynamic \
     --model_input public/models/ch_PP-OCRv4_det_infer.onnx \
     --model_output public/models/ch_PP-OCRv4_det_infer_int8.onnx \
     --op_types_to_quantize MatMul
   ```

2. **Enable compression** in your web server:
   ```nginx
   # Nginx example
   gzip on;
   gzip_types application/octet-stream;
   ```

### Runtime Optimization

1. **Preload models** on app initialization
2. **Use Web Workers** for processing (planned feature)
3. **Cache models** in browser storage

## Troubleshooting

### Common Issues

1. **Models not loading**
   - Check file paths in browser developer tools
   - Ensure CORS headers are set correctly
   - Verify model files are not corrupted

2. **WASM errors**
   - Ensure ONNX Runtime WASM files are in `/public/onnx/`
   - Check browser compatibility (requires WebAssembly support)

3. **Low accuracy**
   - Ensure good image quality and lighting
   - Try preprocessing images (contrast, brightness)
   - Consider using higher resolution models

4. **Performance issues**
   - Use quantized models for faster inference
   - Enable SIMD if supported by browser
   - Consider reducing image resolution

### Browser Compatibility

- **Chrome/Edge**: Full support with SIMD
- **Firefox**: Full support
- **Safari**: Basic support (no SIMD)
- **Mobile browsers**: Limited by memory and processing power

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('debug-ocr', 'true')
```

## Model Information

### PP-OCRv4 Models

- **Detection Model**: Detects text regions in images
  - Input: 640x640 RGB image
  - Output: Text bounding boxes with confidence scores

- **Recognition Model**: Recognizes text content in detected regions
  - Input: 32x320 RGB image (cropped text region)
  - Output: Character sequence with confidence scores

### Supported Languages

Current setup supports:
- Chinese (Simplified & Traditional)
- English
- Numbers and mathematical symbols

For other languages, download appropriate PaddleOCR models from the official repository.

## Contributing

To improve PaddleOCR integration:

1. **Model optimization**: Help optimize model conversion and quantization
2. **Language support**: Add support for additional languages
3. **Performance**: Implement Web Workers for background processing
4. **Accuracy**: Improve mathematical expression parsing

## Resources

- [PaddleOCR Official Repository](https://github.com/PaddlePaddle/PaddleOCR)
- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/get-started/with-javascript.html)
- [Paddle2ONNX Conversion Tool](https://github.com/PaddlePaddle/Paddle2ONNX)
- [Model Download Links](https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_en/models_list_en.md)

---

**Note**: PaddleOCR models are larger than Tesseract.js but provide significantly better accuracy for mathematical text recognition. The hybrid approach ensures reliability while maximizing accuracy when conditions are optimal.