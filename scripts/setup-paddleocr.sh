#!/bin/bash

# SnapCalc PaddleOCR Setup Script
# This script downloads PaddleOCR models and ONNX Runtime WASM files

set -e  # Exit on any error

echo "🚀 Setting up PaddleOCR for SnapCalc..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p public/models
mkdir -p public/onnx
mkdir -p /tmp/paddleocr

# Function to download with progress
download_with_progress() {
    local url=$1
    local output=$2
    local description=$3
    
    echo -e "${BLUE}⬇️  Downloading ${description}...${NC}"
    if command -v wget >/dev/null 2>&1; then
        wget --progress=bar:force:noscroll "$url" -O "$output"
    elif command -v curl >/dev/null 2>&1; then
        curl -L --progress-bar "$url" -o "$output"
    else
        echo -e "${RED}❌ Error: Neither wget nor curl is available${NC}"
        exit 1
    fi
}

# Check if paddle2onnx is available for model conversion
if command -v paddle2onnx >/dev/null 2>&1; then
    CONVERT_MODELS=true
    echo -e "${GREEN}✅ paddle2onnx found - will convert models from PaddlePaddle format${NC}"
else
    CONVERT_MODELS=false
    echo -e "${YELLOW}⚠️  paddle2onnx not found - will try to download pre-converted models${NC}"
fi

# Download ONNX Runtime WASM files
echo -e "\n${BLUE}📦 Downloading ONNX Runtime WASM files...${NC}"
ONNX_VERSION="1.16.3"
ONNX_BASE_URL="https://cdn.jsdelivr.net/npm/onnxruntime-web@${ONNX_VERSION}/dist"

download_with_progress "${ONNX_BASE_URL}/ort-wasm.wasm" "public/onnx/ort-wasm.wasm" "ONNX Runtime WASM"
download_with_progress "${ONNX_BASE_URL}/ort-wasm-simd.wasm" "public/onnx/ort-wasm-simd.wasm" "ONNX Runtime WASM SIMD"
download_with_progress "${ONNX_BASE_URL}/ort-wasm-threaded.wasm" "public/onnx/ort-wasm-threaded.wasm" "ONNX Runtime WASM Threaded"
download_with_progress "${ONNX_BASE_URL}/ort-training-wasm-simd.wasm" "public/onnx/ort-training-wasm-simd.wasm" "ONNX Runtime Training WASM SIMD"

# Download dictionary file
echo -e "\n${BLUE}📖 Downloading PaddleOCR dictionary...${NC}"
download_with_progress "https://raw.githubusercontent.com/PaddlePaddle/PaddleOCR/release/2.7/ppocr/utils/ppocr_keys_v1.txt" "public/models/ppocr_keys_v1.txt" "PaddleOCR Dictionary"

if [ "$CONVERT_MODELS" = true ]; then
    # Download and convert PaddlePaddle models
    echo -e "\n${BLUE}🔄 Downloading and converting PaddleOCR models...${NC}"
    
    # Detection model
    echo -e "${BLUE}⬇️  Downloading detection model...${NC}"
    download_with_progress "https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_det_infer.tar" "/tmp/paddleocr/det.tar" "Detection Model"
    
    echo -e "${BLUE}📦 Extracting detection model...${NC}"
    tar -xf /tmp/paddleocr/det.tar -C /tmp/paddleocr/
    
    echo -e "${BLUE}🔄 Converting detection model to ONNX...${NC}"
    paddle2onnx --model_dir /tmp/paddleocr/ch_PP-OCRv4_det_infer \
                --model_filename inference.pdmodel \
                --params_filename inference.pdiparams \
                --save_file public/models/ch_PP-OCRv4_det_infer.onnx \
                --opset_version 11
    
    # Recognition model
    echo -e "${BLUE}⬇️  Downloading recognition model...${NC}"
    download_with_progress "https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_infer.tar" "/tmp/paddleocr/rec.tar" "Recognition Model"
    
    echo -e "${BLUE}📦 Extracting recognition model...${NC}"
    tar -xf /tmp/paddleocr/rec.tar -C /tmp/paddleocr/
    
    echo -e "${BLUE}🔄 Converting recognition model to ONNX...${NC}"
    paddle2onnx --model_dir /tmp/paddleocr/ch_PP-OCRv4_rec_infer \
                --model_filename inference.pdmodel \
                --params_filename inference.pdiparams \
                --save_file public/models/ch_PP-OCRv4_rec_infer.onnx \
                --opset_version 11
    
else
    # Try to download pre-converted models from community sources
    echo -e "\n${YELLOW}⚠️  Attempting to download pre-converted ONNX models...${NC}"
    echo -e "${YELLOW}Note: These may not be available. Consider installing paddle2onnx for model conversion.${NC}"
    
    # Try GitHub releases or other sources (these URLs are examples)
    # In practice, you'd need to host these files or find reliable sources
    echo -e "${RED}❌ Pre-converted models not available in this script.${NC}"
    echo -e "${YELLOW}Please install paddle2onnx and run this script again, or manually convert the models.${NC}"
    echo -e "${BLUE}Installation instructions:${NC}"
    echo -e "  pip install paddle2onnx"
    echo -e "  Then run this script again."
fi

# Clean up temporary files
echo -e "\n${BLUE}🧹 Cleaning up temporary files...${NC}"
rm -rf /tmp/paddleocr

# Verify installation
echo -e "\n${BLUE}🔍 Verifying installation...${NC}"

check_file() {
    if [ -f "$1" ]; then
        size=$(du -h "$1" | cut -f1)
        echo -e "${GREEN}✅ $1 (${size})${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 (missing)${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}📋 Installation Summary:${NC}"

# Check ONNX Runtime files
echo -e "\n${BLUE}ONNX Runtime WASM files:${NC}"
check_file "public/onnx/ort-wasm.wasm"
check_file "public/onnx/ort-wasm-simd.wasm"
check_file "public/onnx/ort-wasm-threaded.wasm"
check_file "public/onnx/ort-training-wasm-simd.wasm"

# Check PaddleOCR files
echo -e "\n${BLUE}PaddleOCR files:${NC}"
check_file "public/models/ppocr_keys_v1.txt"

if [ "$CONVERT_MODELS" = true ]; then
    detection_ok=false
    recognition_ok=false
    
    if check_file "public/models/ch_PP-OCRv4_det_infer.onnx"; then
        detection_ok=true
    fi
    
    if check_file "public/models/ch_PP-OCRv4_rec_infer.onnx"; then
        recognition_ok=true
    fi
    
    if [ "$detection_ok" = true ] && [ "$recognition_ok" = true ]; then
        echo -e "\n${GREEN}🎉 PaddleOCR setup completed successfully!${NC}"
        echo -e "${GREEN}✅ SnapCalc will now use PaddleOCR for enhanced OCR accuracy${NC}"
    else
        echo -e "\n${RED}❌ PaddleOCR model conversion failed${NC}"
        echo -e "${YELLOW}⚠️  SnapCalc will fall back to Tesseract.js${NC}"
    fi
else
    echo -e "\n${YELLOW}⚠️  PaddleOCR models not installed${NC}"
    echo -e "${YELLOW}SnapCalc will use Tesseract.js as the primary OCR engine${NC}"
    echo -e "\n${BLUE}To enable PaddleOCR:${NC}"
    echo -e "1. Install paddle2onnx: ${YELLOW}pip install paddle2onnx${NC}"
    echo -e "2. Run this script again: ${YELLOW}./scripts/setup-paddleocr.sh${NC}"
fi

echo -e "\n${BLUE}📚 Next steps:${NC}"
echo -e "1. Copy .env.example to .env.local if you haven't already"
echo -e "2. Run ${YELLOW}npm run dev${NC} to start the development server"
echo -e "3. Open http://localhost:3000 in your browser"
echo -e "\n${BLUE}📖 For more information, see:${NC}"
echo -e "  - docs/PADDLEOCR_SETUP.md"
echo -e "  - README.md"

echo -e "\n${GREEN}🚀 Setup complete!${NC}"