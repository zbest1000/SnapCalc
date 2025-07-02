import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { paddleOCRService } from './paddleocr.js';
import { ocrService } from './ocr.js';
import { hybridOCRService } from './hybrid-ocr.js';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

/**
 * SnapCalc MCP Server
 * Provides OCR capabilities using PaddleOCR and Tesseract.js through MCP protocol
 */
class SnapCalcMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'snapcalc-ocr',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'ocr_analyze_image',
            description: 'Analyze an image using OCR to extract text and mathematical expressions',
            inputSchema: {
              type: 'object',
              properties: {
                image_path: {
                  type: 'string',
                  description: 'Path to the image file to analyze',
                },
                image_data: {
                  type: 'string',
                  description: 'Base64 encoded image data (alternative to image_path)',
                },
                engine: {
                  type: 'string',
                  enum: ['hybrid', 'paddleocr', 'tesseract'],
                  default: 'hybrid',
                  description: 'OCR engine to use for analysis',
                },
                extract_calculations: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to extract and evaluate mathematical expressions',
                },
              },
              required: [],
              oneOf: [
                { required: ['image_path'] },
                { required: ['image_data'] }
              ],
            },
          },
          {
            name: 'ocr_extract_calculations',
            description: 'Extract and evaluate mathematical expressions from text',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Text containing mathematical expressions',
                },
                evaluate: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to evaluate the mathematical expressions',
                },
              },
              required: ['text'],
            },
          },
          {
            name: 'ocr_process_calculator_display',
            description: 'Process calculator display image to extract calculation results',
            inputSchema: {
              type: 'object',
              properties: {
                image_path: {
                  type: 'string',
                  description: 'Path to calculator display image',
                },
                image_data: {
                  type: 'string',
                  description: 'Base64 encoded calculator display image data',
                },
                calculator_type: {
                  type: 'string',
                  enum: ['scientific', 'basic', 'graphing', 'financial'],
                  default: 'basic',
                  description: 'Type of calculator display',
                },
              },
              required: [],
              oneOf: [
                { required: ['image_path'] },
                { required: ['image_data'] }
              ],
            },
          },
          {
            name: 'ocr_batch_process',
            description: 'Process multiple images for OCR analysis',
            inputSchema: {
              type: 'object',
              properties: {
                image_paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of image file paths to process',
                },
                engine: {
                  type: 'string',
                  enum: ['hybrid', 'paddleocr', 'tesseract'],
                  default: 'hybrid',
                  description: 'OCR engine to use for all images',
                },
                extract_calculations: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to extract calculations from all images',
                },
              },
              required: ['image_paths'],
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'ocr_analyze_image':
            return await this.handleOCRAnalyzeImage(args);
          case 'ocr_extract_calculations':
            return await this.handleExtractCalculations(args);
          case 'ocr_process_calculator_display':
            return await this.handleProcessCalculatorDisplay(args);
          case 'ocr_batch_process':
            return await this.handleBatchProcess(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleOCRAnalyzeImage(args: any) {
    const { image_path, image_data, engine = 'hybrid', extract_calculations = true } = args;
    
    let imageInput: string | File;
    
    if (image_path) {
      if (!fs.existsSync(image_path)) {
        throw new Error(`Image file not found: ${image_path}`);
      }
      
      // Convert file to data URL for processing
      const imageBuffer = fs.readFileSync(image_path);
      const mimeType = this.getMimeType(image_path);
      imageInput = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } else if (image_data) {
      // Ensure proper data URL format
      imageInput = image_data.startsWith('data:') ? image_data : `data:image/jpeg;base64,${image_data}`;
    } else {
      throw new Error('Either image_path or image_data must be provided');
    }

    let result;
    
    // Initialize the appropriate OCR service
    switch (engine) {
      case 'paddleocr':
        await paddleOCRService.initialize();
        result = await paddleOCRService.processImage(imageInput);
        break;
      case 'tesseract':
        await ocrService.initialize();
        result = await ocrService.processImage(imageInput);
        break;
      case 'hybrid':
      default:
        await hybridOCRService.initialize();
        result = await hybridOCRService.processImage(imageInput);
        break;
    }

    // Extract calculations if requested
    let calculations = null;
    if (extract_calculations && result.text) {
      calculations = this.extractCalculationsFromText(result.text);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            text: result.text,
            confidence: result.confidence,
            engine: engine === 'hybrid' ? result.engine : engine,
            calculations: calculations,
            boxes: result.boxes || [],
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleExtractCalculations(args: any) {
    const { text, evaluate = true } = args;
    
    const calculations = this.extractCalculationsFromText(text, evaluate);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            original_text: text,
            calculations: calculations,
            total_expressions: calculations.length,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleProcessCalculatorDisplay(args: any) {
    const { image_path, image_data, calculator_type = 'basic' } = args;
    
    let imageInput: string;
    
    if (image_path) {
      if (!fs.existsSync(image_path)) {
        throw new Error(`Image file not found: ${image_path}`);
      }
      
      const imageBuffer = fs.readFileSync(image_path);
      const mimeType = this.getMimeType(image_path);
      imageInput = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } else if (image_data) {
      imageInput = image_data.startsWith('data:') ? image_data : `data:image/jpeg;base64,${image_data}`;
    } else {
      throw new Error('Either image_path or image_data must be provided');
    }

    // Preprocess image for calculator display (enhance contrast, resize, etc.)
    const processedImage = await this.preprocessCalculatorImage(imageInput, calculator_type);
    
    // Use hybrid OCR for best results
    await hybridOCRService.initialize();
    const result = await hybridOCRService.processImage(processedImage);
    
    // Parse calculator-specific patterns
    const calculatorResult = this.parseCalculatorDisplay(result.text, calculator_type);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            calculator_type: calculator_type,
            raw_text: result.text,
            parsed_result: calculatorResult,
            confidence: result.confidence,
            engine: result.engine,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleBatchProcess(args: any) {
    const { image_paths, engine = 'hybrid', extract_calculations = true } = args;
    
    const results = [];
    
    for (const imagePath of image_paths) {
      try {
        const result = await this.handleOCRAnalyzeImage({
          image_path: imagePath,
          engine,
          extract_calculations,
        });
        
        results.push({
          image_path: imagePath,
          status: 'success',
          result: JSON.parse(result.content[0].text),
        });
      } catch (error) {
        results.push({
          image_path: imagePath,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total_images: image_paths.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'error').length,
            results: results,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  private async preprocessCalculatorImage(imageData: string, calculatorType: string): Promise<string> {
    try {
      // Extract base64 data
      const base64Data = imageData.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Apply preprocessing based on calculator type
      let processedBuffer = await sharp(imageBuffer)
        .grayscale()
        .normalize()
        .sharpen()
        .threshold(128)
        .png()
        .toBuffer();
      
      // Calculator-specific preprocessing
      switch (calculatorType) {
        case 'scientific':
          // Higher contrast for complex displays
          processedBuffer = await sharp(processedBuffer)
            .linear(1.2, -20)
            .toBuffer();
          break;
        case 'graphing':
          // Focus on text areas, reduce noise
          processedBuffer = await sharp(processedBuffer)
            .median(2)
            .toBuffer();
          break;
      }
      
      return `data:image/png;base64,${processedBuffer.toString('base64')}`;
    } catch (error) {
      console.warn('Image preprocessing failed, using original:', error);
      return imageData;
    }
  }

  private parseCalculatorDisplay(text: string, calculatorType: string) {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Common calculator display patterns
    const patterns = {
      result: /(\d+(?:\.\d+)?)\s*$/, // Final result at the end
      expression: /^(.+?)\s*=\s*(\d+(?:\.\d+)?)/, // Expression = result
      operation: /(\d+(?:\.\d+)?)\s*([+\-*/÷×])\s*(\d+(?:\.\d+)?)\s*=?\s*(\d+(?:\.\d+)?)?/,
      error: /(error|overflow|undefined)/i,
    };
    
    // Parse based on calculator type
    let parsed = {
      display_text: cleanText,
      current_value: null as number | null,
      last_operation: null as string | null,
      expression: null as string | null,
      is_error: false,
    };
    
    // Check for error states
    if (patterns.error.test(cleanText)) {
      parsed.is_error = true;
      return parsed;
    }
    
    // Try to extract current value and operation
    const operationMatch = cleanText.match(patterns.operation);
    if (operationMatch) {
      parsed.expression = `${operationMatch[1]} ${operationMatch[2]} ${operationMatch[3]}`;
      parsed.last_operation = operationMatch[2];
      parsed.current_value = operationMatch[4] ? parseFloat(operationMatch[4]) : null;
    } else {
      const resultMatch = cleanText.match(patterns.result);
      if (resultMatch) {
        parsed.current_value = parseFloat(resultMatch[1]);
      }
    }
    
    return parsed;
  }

  private extractCalculationsFromText(text: string, evaluate: boolean = true) {
    const calculations = [];
    
    // Enhanced mathematical expression patterns
    const patterns = [
      // Basic arithmetic with equals
      /(\d+(?:\.\d+)?)\s*([+\-*/÷×])\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/g,
      // Expression without result
      /(\d+(?:\.\d+)?)\s*([+\-*/÷×])\s*(\d+(?:\.\d+)?)/g,
      // Percentage calculations
      /(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/gi,
      // Square and power operations
      /(\d+(?:\.\d+)?)\s*\^?\s*(\d+)/g,
    ];
    
    patterns.forEach((pattern, index) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        const expression = match[0];
        let normalized = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/\s+/g, ' ')
          .trim();
        
        let result = null;
        let operation_type = 'arithmetic';
        
        if (evaluate) {
          try {
            if (index === 2) { // Percentage
              operation_type = 'percentage';
              const value = parseFloat(match[1]);
              const base = parseFloat(match[2]);
              result = (value / 100) * base;
            } else if (index === 3) { // Power
              operation_type = 'power';
              const base = parseFloat(match[1]);
              const exponent = parseFloat(match[2]);
              result = Math.pow(base, exponent);
            } else {
              // Remove result part if present for evaluation
              const expressionPart = normalized.split('=')[0].trim();
              result = Function(`"use strict"; return (${expressionPart})`)();
            }
            
            if (typeof result === 'number' && !isNaN(result)) {
              result = Math.round(result * 1000000) / 1000000; // Round to 6 decimal places
            } else {
              result = null;
            }
          } catch (error) {
            result = null;
          }
        }
        
        calculations.push({
          original_expression: expression,
          normalized_expression: normalized,
          operation_type,
          calculated_result: result,
          position: match.index,
        });
      }
    });
    
    return calculations;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Run the server if this file is executed directly
if (require.main === module) {
  const server = new SnapCalcMCPServer();
  server.run().catch(console.error);
}

export { SnapCalcMCPServer };