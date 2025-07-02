# SnapCalc MCP Server Integration

This document describes the integration of PaddleOCR MCP server capabilities into the SnapCalc project, enabling AI assistants and tools to interact with SnapCalc's advanced OCR functionality through the Model Context Protocol (MCP).

## Overview

The SnapCalc MCP server provides a standardized interface for AI models to access OCR capabilities, specifically designed for processing calculator displays and mathematical expressions. It combines the power of PaddleOCR and Tesseract.js through a unified MCP interface.

## Features

### Core OCR Tools

1. **`ocr_analyze_image`** - Advanced image analysis with mathematical expression extraction
2. **`ocr_extract_calculations`** - Text-based mathematical expression parsing and evaluation
3. **`ocr_process_calculator_display`** - Specialized calculator display processing
4. **`ocr_batch_process`** - Bulk image processing capabilities

### Key Capabilities

- **Multi-Engine Support**: Hybrid OCR using both PaddleOCR and Tesseract.js
- **Mathematical Expression Recognition**: Automatic detection and evaluation of calculations
- **Calculator-Specific Processing**: Optimized handling of different calculator types
- **Batch Processing**: Efficient processing of multiple images
- **Image Preprocessing**: Automatic enhancement for better OCR accuracy
- **Flexible Input**: Support for both file paths and base64 encoded images

## Installation and Setup

### Prerequisites

```bash
# Node.js 16+ required
node --version

# Install dependencies
npm install @modelcontextprotocol/sdk sharp
```

### Configuration

1. **Basic MCP Client Configuration**:

```json
{
  "mcpServers": {
    "snapcalc-ocr": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "/path/to/snapcalc"
    }
  }
}
```

2. **Claude Desktop Configuration** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "snapcalc-ocr": {
      "command": "node",
      "args": ["/path/to/snapcalc/mcp-server.js"]
    }
  }
}
```

3. **VS Code with Continue Extension**:

```json
{
  "mcp": {
    "servers": {
      "snapcalc-ocr": {
        "command": "node",
        "args": ["mcp-server.js"],
        "cwd": "/path/to/snapcalc"
      }
    }
  }
}
```

## Usage Examples

### 1. Basic Image OCR Analysis

```javascript
// Tool call example
{
  "tool": "ocr_analyze_image",
  "arguments": {
    "image_path": "./calculator_display.jpg",
    "engine": "hybrid",
    "extract_calculations": true
  }
}
```

**Expected Response**:
```json
{
  "text": "2 + 3 = 5",
  "confidence": 0.95,
  "engine": "paddleocr",
  "calculations": [
    {
      "original_expression": "2 + 3 = 5",
      "normalized_expression": "2 + 3",
      "operation_type": "arithmetic",
      "calculated_result": 5,
      "position": 0
    }
  ],
  "boxes": [[50, 50, 200, 30]],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Calculator Display Processing

```javascript
{
  "tool": "ocr_process_calculator_display",
  "arguments": {
    "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "calculator_type": "scientific"
  }
}
```

**Expected Response**:
```json
{
  "calculator_type": "scientific",
  "raw_text": "sin(30) = 0.5",
  "parsed_result": {
    "display_text": "sin(30) = 0.5",
    "current_value": 0.5,
    "last_operation": "=",
    "expression": "sin(30)",
    "is_error": false
  },
  "confidence": 0.92,
  "engine": "hybrid",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Text-Based Calculation Extraction

```javascript
{
  "tool": "ocr_extract_calculations",
  "arguments": {
    "text": "The results show: 15 × 4 = 60 and 25% of 80 = 20",
    "evaluate": true
  }
}
```

**Expected Response**:
```json
{
  "original_text": "The results show: 15 × 4 = 60 and 25% of 80 = 20",
  "calculations": [
    {
      "original_expression": "15 × 4 = 60",
      "normalized_expression": "15 * 4",
      "operation_type": "arithmetic",
      "calculated_result": 60,
      "position": 18
    },
    {
      "original_expression": "25% of 80 = 20",
      "normalized_expression": "25% of 80",
      "operation_type": "percentage",
      "calculated_result": 20,
      "position": 35
    }
  ],
  "total_expressions": 2,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Batch Processing

```javascript
{
  "tool": "ocr_batch_process",
  "arguments": {
    "image_paths": [
      "./calc1.jpg",
      "./calc2.png", 
      "./calc3.jpeg"
    ],
    "engine": "paddleocr",
    "extract_calculations": true
  }
}
```

## AI Assistant Integration Examples

### Claude Integration

```
You are now connected to SnapCalc's OCR server. You can:

1. Analyze calculator display images
2. Extract mathematical expressions from images
3. Process multiple images in batch
4. Parse text for mathematical calculations

Example usage:
"Please analyze this calculator display image: [upload image]"
"Extract all calculations from this document image"
"Process these 5 calculator screenshots for me"
```

### ChatGPT with MCP Plugin

```
SnapCalc OCR is now available. I can help you:

• Read calculator displays from photos
• Extract math expressions from documents  
• Process multiple calculation images
• Verify mathematical calculations

Try: "Analyze the calculation in this image" [attach image]
```

### VS Code Continue Extension

```typescript
// In your code, you can now use:
// @snapcalc-ocr analyze this calculator image
// @snapcalc-ocr extract calculations from this text
// @snapcalc-ocr process multiple calculator screenshots
```

## Supported Input Formats

### Image Formats
- **JPEG/JPG**: Standard photo format
- **PNG**: High-quality images with transparency
- **GIF**: Animated or static images
- **WebP**: Modern web-optimized format

### Calculator Types
- **basic**: Standard arithmetic calculators
- **scientific**: Advanced scientific calculators
- **graphing**: Graphing calculators with displays
- **financial**: Financial and business calculators

### OCR Engines
- **hybrid**: Automatic selection of best engine (recommended)
- **paddleocr**: PaddleOCR for high accuracy
- **tesseract**: Tesseract.js for broad compatibility

## Advanced Configuration

### Environment Variables

```bash
# Set OCR engine preferences
export SNAPCALC_DEFAULT_ENGINE=hybrid
export SNAPCALC_CONFIDENCE_THRESHOLD=0.8
export SNAPCALC_MAX_BATCH_SIZE=10

# Image processing settings
export SNAPCALC_IMAGE_MAX_SIZE=2048
export SNAPCALC_PREPROCESSING_ENABLED=true
```

### Custom MCP Client Configuration

```json
{
  "mcpServers": {
    "snapcalc-ocr": {
      "command": "node",
      "args": ["mcp-server.js"],
      "env": {
        "NODE_ENV": "production",
        "SNAPCALC_DEFAULT_ENGINE": "paddleocr",
        "SNAPCALC_CONFIDENCE_THRESHOLD": "0.85"
      },
      "timeout": 30000,
      "restart": true
    }
  }
}
```

## Error Handling

The MCP server provides comprehensive error handling:

### Common Error Types

1. **File Not Found**: Invalid image path
2. **Invalid Image Format**: Unsupported image type
3. **OCR Processing Failed**: Engine-specific errors
4. **Calculation Parse Error**: Invalid mathematical expressions

### Error Response Format

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Image file not found: ./nonexistent.jpg"
    }
  ],
  "isError": true
}
```

## Performance Considerations

### Optimization Tips

1. **Image Size**: Resize large images before processing
2. **Batch Processing**: Use batch operations for multiple images
3. **Engine Selection**: Choose appropriate OCR engine for your use case
4. **Preprocessing**: Enable image preprocessing for low-quality images

### Performance Benchmarks

| Operation | Avg Time | Memory Usage |
|-----------|----------|--------------|
| Single Image OCR | 2-5 seconds | 50-100MB |
| Calculator Display | 1-3 seconds | 30-70MB |
| Batch Processing (5 images) | 8-15 seconds | 200-400MB |
| Text Calculation Extraction | <1 second | 10-20MB |

## Troubleshooting

### Common Issues

1. **MCP Server Won't Start**
   ```bash
   # Check Node.js version
   node --version  # Should be 16+
   
   # Verify dependencies
   npm list @modelcontextprotocol/sdk sharp
   ```

2. **Low OCR Accuracy**
   - Try different OCR engines
   - Enable image preprocessing
   - Check image quality and resolution

3. **Mathematical Expression Not Detected**
   - Verify expression format
   - Check for special characters
   - Try manual text extraction first

### Debug Mode

```bash
# Run server with debug output
DEBUG=snapcalc:* node mcp-server.js
```

## Contributing

To extend the MCP server functionality:

1. **Add New Tools**: Extend the tool list in `setupToolHandlers()`
2. **Custom OCR Engines**: Implement new engine adapters
3. **Enhanced Preprocessing**: Add image enhancement algorithms
4. **Additional Parsers**: Create specialized calculation parsers

### Development Setup

```bash
# Clone and setup
git clone https://github.com/your-org/snapcalc
cd snapcalc
npm install

# Run in development mode
npm run dev

# Test MCP server
node mcp-server.js
```

## Security Considerations

- **File Path Validation**: Server validates all file paths
- **Image Size Limits**: Prevents oversized image processing
- **Execution Sandboxing**: Mathematical evaluation is sandboxed
- **Input Sanitization**: All inputs are validated and sanitized

## License

This MCP server integration is part of the SnapCalc project and follows the same licensing terms.

## Support

For issues and questions:
- **GitHub Issues**: [Project Issues](https://github.com/your-org/snapcalc/issues)
- **Documentation**: [SnapCalc Docs](https://snapcalc.dev/docs)
- **Community**: [Discord Server](https://discord.gg/snapcalc)